import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthenticatedRequest } from '../../auth/authenticated-user';
import { SupportTicketService } from './support-ticket.service';
import { CreateSupportTicketDto, CreateTicketCommentDto } from './operations.dtos';
import { OperationsOwnershipGuard, OperationsResource } from './operations.guards';

@ApiTags('Support Tickets')
@Controller('support-tickets')
@UseGuards(SupabaseJwtAuthGuard, OperationsOwnershipGuard)
@ApiBearerAuth()
export class SupportTicketController {
  constructor(private readonly ticketService: SupportTicketService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @OperationsResource('support_ticket')
  @ApiOperation({ summary: 'Create a support ticket' })
  async createTicket(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateSupportTicketDto,
  ) {
    return this.ticketService.createTicket(req.internalUserId!, dto);
  }

  @Get()
  @OperationsResource('support_ticket')
  @ApiOperation({ summary: 'List my support tickets' })
  async getMyTickets(@Req() req: AuthenticatedRequest) {
    return this.ticketService.getMyTickets(req.internalUserId!);
  }

  @Get(':id')
  @OperationsResource('support_ticket')
  @ApiOperation({ summary: 'Get a support ticket by ID (own only)' })
  async getTicketById(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.ticketService.getTicketById(req.internalUserId!, id);
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @OperationsResource('support_ticket')
  @ApiOperation({ summary: 'Add a comment to own ticket' })
  async addComment(
    @Req() req: AuthenticatedRequest,
    @Param('id') ticketId: string,
    @Body() dto: CreateTicketCommentDto,
  ) {
    return this.ticketService.addComment(req.internalUserId!, ticketId, dto);
  }
}
