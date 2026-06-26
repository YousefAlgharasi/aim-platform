import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthenticatedRequest } from '../../auth/authenticated-user';
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
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.ticketService.adminUpdateStatus(id, status, req.internalUserId!);
  }

  @Patch(':id/assign')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Assign support ticket (admin)' })
  async assignTicket(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('assigneeId') assigneeId: string,
  ) {
    return this.ticketService.adminAssign(id, assigneeId, req.internalUserId!);
  }
}
