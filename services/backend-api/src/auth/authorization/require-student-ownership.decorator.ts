import { SetMetadata } from '@nestjs/common';
import { AuthorizedRole, PRIVILEGED_OWNERSHIP_ROLES } from './authorized-role';
import {
  DEFAULT_STUDENT_ID_PARAM,
  STUDENT_OWNERSHIP_REQUIREMENT_KEY,
} from './authorization.constants';
import { StudentOwnershipRequirement } from './ownership-policy';

export interface RequireStudentOwnershipOptions {
  readonly paramName?: string;
  readonly privilegedRoles?: readonly AuthorizedRole[];
}

export const RequireStudentOwnership = (
  options: RequireStudentOwnershipOptions = {},
): MethodDecorator & ClassDecorator => {
  const requirement: StudentOwnershipRequirement = {
    paramName: options.paramName ?? DEFAULT_STUDENT_ID_PARAM,
    privilegedRoles: options.privilegedRoles ?? PRIVILEGED_OWNERSHIP_ROLES,
  };

  return SetMetadata(STUDENT_OWNERSHIP_REQUIREMENT_KEY, requirement);
};
