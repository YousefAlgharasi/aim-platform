import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { FeatureRequestService } from './feature-request.service';
import { CreateFeatureRequestDto } from './operations.dtos';
import { OperationsOwnershipGuard, OperationsResource } from './operations.guards';

@ApiTags('Feature Requests')
@Controller('feature-requests')
@UseGuards(SupabaseJwtAuthGuard, OperationsOwnershipGuard)
@ApiBearerAuth()
export class FeatureRequestController {
  constructor(private readonly featureRequestService: FeatureRequestService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @OperationsResource('feature_request')
  @ApiOperation({ summary: 'Submit a feature request' })
  async createRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateFeatureRequestDto,
  ) {
    return this.featureRequestService.createRequest(user.internalUserId, dto);
  }

  @Get()
  @OperationsResource('feature_request')
  @ApiOperation({ summary: 'List feature requests' })
  async listRequests(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.featureRequestService.listRequests(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get(':id')
  @OperationsResource('feature_request')
  @ApiOperation({ summary: 'Get a feature request by ID' })
  async getById(@Param('id') id: string) {
    return this.featureRequestService.getById(id);
  }

  @Post(':id/vote')
  @HttpCode(HttpStatus.OK)
  @OperationsResource('feature_request')
  @ApiOperation({ summary: 'Vote on a feature request' })
  async vote(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.featureRequestService.vote(id, user.internalUserId);
  }
}
