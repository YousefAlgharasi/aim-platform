import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password!: string;
}

export class AuthRegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ required: false, description: 'Full / display name for the new student profile.' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ required: false, description: 'Alias for displayName.' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: 'Alias for displayName.' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ required: false, description: 'Web origin to redirect to after email confirmation. Must match an allowed CORS origin.' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  redirectUrl?: string;
}

export class AuthBootstrapDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class AuthRefreshDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}

export class AuthForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ required: false, description: 'Web origin to redirect to after password reset link click. Must match an allowed CORS origin.' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  redirectUrl?: string;
}

export class AuthResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;
}

export class AuthGoogleLoginDto {
  @ApiProperty({ description: 'Google OAuth ID Token obtained from Google Sign-In SDK.' })
  @IsString()
  @MinLength(1)
  idToken!: string;

  @ApiProperty({ required: false, description: 'Optional nonce used for ID token verification.' })
  @IsOptional()
  @IsString()
  nonce?: string;
}

