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
import { UsersService } from '../users/users.service';
import { InvoiceService } from './invoice.service';
import { Invoice, InvoiceItem } from './billing.entities';

@ApiTags('Billing')
@Controller('billing/invoices')
export class InvoicesController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List invoices for current user' })
  async getUserInvoices(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Invoice[]> {
    const internalUser = await this.usersService.getBySupabaseUid(user.id);
    return this.invoiceService.getUserInvoices(internalUser.id);
  }

  @Get(':id')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoice by ID' })
  async getInvoice(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ invoice: Invoice; items: InvoiceItem[] }> {
    const internalUser = await this.usersService.getBySupabaseUid(user.id);
    return this.invoiceService.getInvoiceWithItems(id, internalUser.id);
  }
}
