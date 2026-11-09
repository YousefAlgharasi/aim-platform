import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { OperationsAdminGuard } from '../operations/operations.guards';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { TtsGatewayModule } from '../voice-teacher/tts-gateway/tts-gateway.module';
import { AdminVocabularyLibraryController, VocabularyLibraryController } from './vocabulary-library.controllers';
import { VocabularyLibraryService } from './vocabulary-library.service';

/** Vocabulary library: browse words with Arabic translation, listen, save to My words; admins manage the words. */
@Module({
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule, TtsGatewayModule],
  controllers: [VocabularyLibraryController, AdminVocabularyLibraryController],
  providers: [VocabularyLibraryService, OperationsAdminGuard],
})
export class VocabularyLibraryModule {}
