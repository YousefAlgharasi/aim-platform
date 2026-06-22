import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
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
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSupportTicketDto,
  ) {
    return this.ticketService.createTicket(user.id, dto);
  }

  @Get()
  @OperationsResource('support_ticket')
  @ApiOperation({ summary: 'List my support tickets' })
  async getMyTickets(@CurrentUser() user: AuthenticatedUser) {
    return this.ticketService.getMyTickets(user.id);
  }

  @Get(':id')
  @OperationsResource('support_ticket')
  @ApiOperation({ summary: 'Get a support ticket by ID (own only)' })
  async getTicketById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.ticketService.getTicketById(user.id, id);
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @OperationsResource('support_ticket')
  @ApiOperation({ summary: 'Add a comment to own ticket' })
  async addComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') ticketId: string,
    @Body() dto: CreateTicketCommentDto,
  ) {
    return this.ticketService.addComment(user.id, ticketId, dto);
  }
}
