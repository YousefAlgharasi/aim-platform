import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { DatabaseModule } from '../../../database/database.module';
import { RolesModule } from '../../roles/roles.module';
import { UsersModule } from '../../users/users.module';
import { QuestionBankController } from './question-bank.controller';
import { QuestionBankService } from './question-bank.service';

// Phase 3 — P3-042
// Fix: this module was missing `imports`, so DatabaseService (and the auth
// guards used by QuestionBankController) could not be resolved once
// QuestionBankModule was actually registered in CurriculumModule. See
// curriculum.module.ts and the P3-042 completion notes.

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule],
  controllers: [QuestionBankController],
  providers: [QuestionBankService],
  exports: [QuestionBankService],
})
export class QuestionBankModule {}
