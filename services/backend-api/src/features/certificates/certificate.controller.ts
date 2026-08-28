// CertificateController.
//
// Scope: Admin read access to issued course-completion certificates.
//
// Security rules:
// - Guarded by SupabaseJwtAuthGuard and RoleGuard — admin roles only.
// - Read-only. Certificates are issued as a side effect of
//   AdminStudentProfileService reading a student's profile (see
//   issueIfCompleted), never through a direct write endpoint here.

import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { RequireRoles } from '../../auth/authorization/required-roles.decorator';
import { RoleGuard } from '../../auth/authorization/role.guard';
import { OPENAPI_TAGS } from '../../openapi/openapi.tags';
import { CertificateService } from './certificate.service';
import { Certificate } from './certificate.types';

@ApiTags(OPENAPI_TAGS.admin)
@ApiBearerAuth()
@Controller('admin/certificates')
@UseGuards(SupabaseJwtAuthGuard, RoleGuard)
@RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
export class CertificateController {
  constructor(private readonly certificates: CertificateService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get an issued certificate by id (admin, read-only).' })
  @ApiParam({ name: 'id', description: 'Certificate UUID.' })
  @ApiOkResponse({ description: 'The certificate, including its score snapshot at issuance.' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<Certificate> {
    const certificate = await this.certificates.getById(id);
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    return certificate;
  }
}
