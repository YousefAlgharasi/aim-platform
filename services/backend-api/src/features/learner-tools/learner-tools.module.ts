import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { LearnerToolsController } from './learner-tools.controller';
import { AiTeacherGovernanceModule } from '../ai-teacher/governance/governance.module';
import { ProviderGatewayModule } from '../ai-teacher/provider-gateway/provider-gateway.module';
import { SessionsModule } from '../sessions/sessions.module';
import { MistakesService } from './mistakes.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { RecoveryService } from './recovery.service';
import { RecoveryNudgeService } from './recovery-nudge.service';
import { SkillPracticeService } from './skill-practice.service';
import { StoriesService } from './stories.service';
import { AdminStoriesController } from './admin-stories.controller';
import { AdminStoriesService } from './admin-stories.service';
import { OperationsAdminGuard } from '../operations/operations.guards';
import { LessonsModule } from '../lessons/lessons.module';
import { PublicCatalogController } from './public-catalog.controller';
import { PublicCatalogService } from './public-catalog.service';
import { SearchService } from './search.service';
import { StudyPlanService } from './study-plan.service';
import { VocabularyService } from './vocabulary.service';

/** Student tools added after launch: saved words, study plan, mistakes retry, search, public catalog. */
@Module({
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule, SessionsModule, AiTeacherGovernanceModule, ProviderGatewayModule, NotificationsModule, LessonsModule],
  controllers: [LearnerToolsController, PublicCatalogController, AdminStoriesController],
  providers: [VocabularyService, StudyPlanService, MistakesService, RecoveryService, RecoveryNudgeService, SkillPracticeService, StoriesService, AdminStoriesService, OperationsAdminGuard, SearchService, PublicCatalogService],
})
export class LearnerToolsModule {}
