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

  @ApiProperty({ required: false, description: 'Web origin to redirect to after email confirmation. Must match an allowed CORS origin.' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  redirectUrl?: string;
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

