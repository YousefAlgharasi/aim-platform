// Phase 2 — P2-032
// Profile service.
//
// Scope: Auth, Users, Roles only.
//
// Responsibility:
//   Coordinate profile read and update operations for the authenticated user.
//   Resolves user_type from the database (via UsersService) and delegates to
//   StudentsService or AdminService accordingly.
//   Applies ownership — a user may only read and update their own profile.
//
// Security rules:
//   - internalUserId is always sourced from the verified JWT via UsersService.
//   - Clients cannot supply user_id, profile_type, roles, or permissions.
//   - Ownership check: profile is returned only for the authenticated user's own ID.
//   - Admin profile existence does NOT grant admin authority.
//   - Backend is the final authority for identity, roles, permissions, and ownership.
//   - No onboarding, placement, lessons, sessions, AIM, AI Teacher, or Student Web App logic.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { AdminService } from '../admin/admin.service';
import { StudentsService } from '../students/students.service';
import { UsersService } from '../users/users.service';
import {
  AdminProfileResponse,
  ProfileMeResponse,
  StudentProfileResponse,
  UpdateProfileMeInput,
} from './profile.types';

@Injectable()
export class ProfileService {
  constructor(
    private readonly users: UsersService,
    private readonly students: StudentsService,
    private readonly admin: AdminService,
  ) {}

  /**
   * Return the safe profile for the authenticated user.
   *
   * Ownership is implicit: internalUserId always comes from the verified JWT —
   * the controller passes it from @CurrentUser(), never from a client payload.
   *
   * Returns only safe fields as defined by docs/phase-2/safe-auth-fields.md.
   */
  async getProfileForUser(internalUserId: string): Promise<ProfileMeResponse> {
    const user = await this.users.getById(internalUserId);
    this.users.assertUserIsActive(user);

    let studentProfile: StudentProfileResponse | null = null;
    let adminProfile: AdminProfileResponse | null = null;

    if (user.userType === 'student') {
      const raw = await this.students.findByUserId(internalUserId);
      if (raw) {
        studentProfile = {
          id: raw.id,
          profileType: 'student_profile',
          displayName: raw.displayName,
          avatarUrl: raw.avatarUrl,
          preferredLanguage: raw.preferredLanguage,
          timezone: raw.timezone,
        };
      }
    } else if (user.userType === 'admin') {
      const raw = await this.admin.findByUserId(internalUserId);
      if (raw) {
        adminProfile = {
          id: raw.id,
          profileType: 'admin_profile',
          displayName: raw.displayName,
          avatarUrl: raw.avatarUrl,
          department: raw.department,
        };
      }
    }
    // reviewer / support / system — no profile row in Phase 2; both remain null.

    return {
      internalUserId: user.id,
      userType: user.userType,
      studentProfile,
      adminProfile,
    };
  }

  /**
   * Update safe profile fields for the authenticated user.
   *
   * Fields applicable only to the user's profile type are forwarded;
   * inapplicable fields (e.g. timezone on an admin) are silently ignored.
   *
   * Ownership is implicit: internalUserId always comes from the verified JWT.
   */
  async updateProfileForUser(
    internalUserId: string,
    input: UpdateProfileMeInput,
  ): Promise<ProfileMeResponse> {
    const user = await this.users.getById(internalUserId);
    this.users.assertUserIsActive(user);

    if (user.userType === 'student') {
      await this.students.updateByUserId(internalUserId, {
        displayName: input.displayName,
        avatarUrl: input.avatarUrl,
        preferredLanguage: input.preferredLanguage,
        timezone: input.timezone,
      });
    } else if (user.userType === 'admin') {
      await this.admin.updateByUserId(internalUserId, {
        displayName: input.displayName,
        avatarUrl: input.avatarUrl,
        department: input.department,
      });
    } else {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Profile update is not supported for this account type',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    // Re-fetch to return the up-to-date safe profile.
    return this.getProfileForUser(internalUserId);
  }
}
