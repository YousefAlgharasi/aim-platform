import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth';
import { DatabaseModule } from '../../database/database.module';
import { ParentChildLinkService } from './parent-child-link.service';
import { ParentInvitationService } from './parent-invitation.service';
import { ParentRepository } from './parent.repository';
import { ParentsController } from './parents.controller';
import { ParentsService } from './parents.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [ParentsController],
  providers: [ParentsService, ParentRepository, ParentChildLinkService, ParentInvitationService],
  exports: [ParentsService, ParentRepository, ParentChildLinkService, ParentInvitationService],
})
export class ParentsModule {}
