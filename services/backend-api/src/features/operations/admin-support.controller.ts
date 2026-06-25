import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { SupportTicketService } from './support-ticket.service';
import { OperationsAdminGuard, OperationsAdminOnly } from './operations.guards';

@ApiTags('Admin Support Tickets')
@Controller('admin/support-tickets')
@UseGuards(SupabaseJwtAuthGuard, OperationsAdminGuard)
@ApiBearerAuth()
export class AdminSupportController {
  constructor(private readonly ticketService: SupportTicketService) {}

  @Get()
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'List all support tickets (admin)' })
  async listAllTickets() {
    return this.ticketService.getAllTickets();
  }

  @Patch(':id/status')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Update support ticket status (admin)' })
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.ticketService.adminUpdateStatus(id, status, user.id);
  }

  @Patch(':id/assign')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Assign support ticket (admin)' })
  async assignTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('assigneeId') assigneeId: string,
  ) {
    return this.ticketService.adminAssign(id, assigneeId, user.id);
  }
}
