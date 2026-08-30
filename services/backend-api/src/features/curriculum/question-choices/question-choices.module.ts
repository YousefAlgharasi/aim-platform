import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { RolesModule } from '../../roles/roles.module';
import { UsersModule } from '../../users/users.module';
import { QuestionChoicesController } from './question-choices.controller';
import { QuestionChoicesService } from './question-choices.service';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule],
  controllers: [QuestionChoicesController],
  providers: [QuestionChoicesService],
  exports: [QuestionChoicesService],
})
export class QuestionChoicesModule {}
