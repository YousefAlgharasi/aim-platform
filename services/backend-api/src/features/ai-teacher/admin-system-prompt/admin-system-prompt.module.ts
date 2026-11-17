import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { PromptBuilderModule } from '../prompt-builder/prompt-builder.module';
import { AdminSystemPromptController } from './admin-system-prompt.controller';

@Module({
  imports: [AuthModule, RolesModule, UsersModule, PromptBuilderModule],
  controllers: [AdminSystemPromptController],
})
export class AdminSystemPromptModule {}
