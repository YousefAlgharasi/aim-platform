import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { LearnerToolsController } from './learner-tools.controller';
import { MistakesService } from './mistakes.service';
import { PublicCatalogController } from './public-catalog.controller';
import { PublicCatalogService } from './public-catalog.service';
import { SearchService } from './search.service';
import { StudyPlanService } from './study-plan.service';
import { VocabularyService } from './vocabulary.service';

/** Student tools added after launch: saved words, study plan, mistakes retry, search, public catalog. */
@Module({
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule],
  controllers: [LearnerToolsController, PublicCatalogController],
  providers: [VocabularyService, StudyPlanService, MistakesService, SearchService, PublicCatalogService],
})
export class LearnerToolsModule {}
