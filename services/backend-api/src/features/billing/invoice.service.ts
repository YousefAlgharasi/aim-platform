import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { BillingRepository } from './billing.repository';
import { Invoice, InvoiceItem } from './billing.entities';
import { validateUUID } from './billing.validation';
import { AnalyticsEventIngestionService } from '../analytics/analytics-event-ingestion.service';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly billingRepo: BillingRepository,
    private readonly analyticsEventIngestionService: AnalyticsEventIngestionService,
  ) {}

  async getUserInvoices(userId: string): Promise<Invoice[]> {
    validateUUID(userId, 'userId');
    return this.billingRepo.findInvoicesByUserId(userId);
  }

  async getInvoiceById(id: string, userId?: string): Promise<Invoice> {
    validateUUID(id, 'invoiceId');
    const invoice = await this.billingRepo.findInvoiceById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    if (userId && invoice.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this invoice');
    }
    return invoice;
  }

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    validateUUID(invoiceId, 'invoiceId');
    return this.billingRepo.findInvoiceItemsByInvoiceId(invoiceId);
  }

  async getInvoiceWithItems(
    id: string,
    userId?: string,
  ): Promise<{ invoice: Invoice; items: InvoiceItem[] }> {
    const invoice = await this.getInvoiceById(id, userId);
    const items = await this.getInvoiceItems(id);
    return { invoice, items };
  }

  async createInvoice(data: {
    userId: string;
    subscriptionId?: string;
    providerInvoiceId?: string;
    status?: Invoice['status'];
    totalAmount: number;
    currency: string;
    dueDate?: Date;
  }): Promise<Invoice> {
    validateUUID(data.userId, 'userId');
    if (data.subscriptionId) validateUUID(data.subscriptionId, 'subscriptionId');

    const invoice = await this.billingRepo.createInvoice({
      userId: data.userId,
      subscriptionId: data.subscriptionId || null,
      providerInvoiceId: data.providerInvoiceId || null,
      status: data.status || 'draft',
      totalAmount: data.totalAmount,
      currency: data.currency.toUpperCase(),
      dueDate: data.dueDate || null,
      metadata: {},
    } as Partial<Invoice>);

    await this.analyticsEventIngestionService.ingest({
      eventType: 'invoice.issued',
      actorRole: 'system',
      actorId: invoice.userId,
      subjectType: 'invoice',
      subjectId: invoice.id,
      metadata: {
        amount: invoice.total,
        currency: invoice.currency,
        period_start: invoice.periodStart,
        period_end: invoice.periodEnd,
      },
    });

    return invoice;
  }

  async updateInvoiceStatus(id: string, status: Invoice['status']): Promise<Invoice> {
    validateUUID(id, 'invoiceId');
    const validStatuses: Invoice['status'][] = ['draft', 'open', 'paid', 'void', 'uncollectible'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid invoice status: ${status}`);
    }

    const invoice = await this.billingRepo.findInvoiceById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const updated = await this.billingRepo.updateInvoice(id, { status });
    if (!updated) {
      throw new NotFoundException('Invoice not found after update');
    }
    return updated;
  }

  async getInvoicesBySubscription(subscriptionId: string): Promise<Invoice[]> {
    validateUUID(subscriptionId, 'subscriptionId');
    return this.billingRepo.findInvoicesBySubscriptionId(subscriptionId);
  }
}
