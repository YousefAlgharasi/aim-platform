import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { CurrentUser } from '../../auth/current-user.decorator';
import { AuthenticatedUser } from '../../auth/authenticated-user';
import { CertificateService } from './certificate.service';
import { Certificate } from './certificate.types';

@ApiTags('Certificates')
@Controller('certificates')
export class StudentCertificateController {
  constructor(private readonly certificates: CertificateService) {}

  /**
   * GET /certificates/my
   *
   * Retrieve all issued course completion certificates for the authenticated student.
   */
  @Get('my')
  @UseGuards(SupabaseJwtAuthGuard, RoleGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all earned course completion certificates for the authenticated student.',
  })
  @ApiOkResponse({
    description: 'Array of certificates earned by the student, including 1,000-point breakdown.',
  })
  async getMyCertificates(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Certificate[]> {
    return this.certificates.listForStudent(user.id);
  }

  /**
   * GET /certificates/:id
   *
   * Retrieve a single certificate by its UUID. Only accessible by the student
   * who earned it or an administrator.
   */
  @Get(':id')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get an issued certificate by ID (student owner or admin).',
  })
  @ApiParam({ name: 'id', description: 'Certificate UUID' })
  @ApiOkResponse({
    description: 'Certificate details with 1,000-point breakdown.',
  })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Certificate> {
    const cert = await this.certificates.getById(id);
    if (!cert) {
      throw new NotFoundException('Certificate not found');
    }

    const isAdmin =
      user.role === AuthorizedRole.ADMIN ||
      user.role === AuthorizedRole.SUPER_ADMIN;

    if (!isAdmin && cert.studentId !== user.id) {
      const isOwner = await this.certificates.verifyOwnership(id, user.id);
      if (!isOwner) {
        throw new ForbiddenException('Access denied to this certificate');
      }
    }

    return cert;
  }

  /**
   * GET /certificates/:id/verify
   *
   * Publicly verify an issued certificate by ID. Does not require authentication,
   * enabling shareable verification links.
   */
  @Get(':id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publicly verify an issued certificate (shareable link).',
  })
  @ApiParam({ name: 'id', description: 'Certificate UUID' })
  @ApiOkResponse({
    description: 'Public verification details for this certificate.',
  })
  async verifyPublic(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Certificate> {
    const cert = await this.certificates.getById(id);
    if (!cert) {
      throw new NotFoundException('Certificate not found or invalid');
    }
    return cert;
  }
}
