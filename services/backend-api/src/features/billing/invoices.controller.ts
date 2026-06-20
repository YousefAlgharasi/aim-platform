import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { InvoiceService } from './invoice.service';
import { Invoice, InvoiceItem } from './billing.entities';

@ApiTags('Billing')
@Controller('billing/invoices')
export class InvoicesController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List invoices for current user' })
  async getUserInvoices(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Invoice[]> {
    return this.invoiceService.getUserInvoices(user.internalUserId);
  }

  @Get(':id')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoice by ID' })
  async getInvoice(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ invoice: Invoice; items: InvoiceItem[] }> {
    return this.invoiceService.getInvoiceWithItems(id, user.internalUserId);
  }
}
