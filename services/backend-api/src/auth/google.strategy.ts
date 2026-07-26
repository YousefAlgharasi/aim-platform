import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { BackendConfigService } from '../config/backend-config.service';

export interface GoogleUserProfile {
  readonly googleId: string;
  readonly email: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly avatarUrl?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: BackendConfigService) {
    super({
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, name, emails, photos } = profile;
    const userProfile: GoogleUserProfile = {
      googleId: id,
      email: emails && emails[0] ? emails[0].value : '',
      firstName: name?.givenName,
      lastName: name?.familyName,
      avatarUrl: photos && photos[0] ? photos[0].value : undefined,
    };
    done(null, userProfile);
  }
}
