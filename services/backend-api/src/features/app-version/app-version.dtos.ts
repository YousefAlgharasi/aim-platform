import { IsOptional, IsString, IsUrl, Matches, ValidateIf } from 'class-validator';

const SEMVER = /^[0-9]+\.[0-9]+\.[0-9]+$/;
const SEMVER_MESSAGE = 'must be a version like 1.2.3';

export class UpdateAppVersionPolicyDto {
  @IsString()
  @Matches(SEMVER, { message: `minSupportedVersion ${SEMVER_MESSAGE}` })
  @IsOptional()
  minSupportedVersion?: string;

  @IsString()
  @Matches(SEMVER, { message: `latestVersion ${SEMVER_MESSAGE}` })
  @IsOptional()
  latestVersion?: string;

  /** null clears the store link. */
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUrl({ protocols: ['https'], require_protocol: true })
  storeUrl?: string | null;
}
