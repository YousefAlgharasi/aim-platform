import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth';
import { DatabaseModule } from '../../database/database.module';
import { ParentChildLinkService } from './parent-child-link.service';
import { ParentConsentService } from './parent-consent.service';
import { ParentRepository } from './parent.repository';
import { ParentsController } from './parents.controller';
import { ParentsService } from './parents.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [ParentsController],
  providers: [ParentsService, ParentRepository, ParentChildLinkService, ParentConsentService],
  exports: [ParentsService, ParentRepository, ParentChildLinkService, ParentConsentService],
})
export class ParentsModule {}
