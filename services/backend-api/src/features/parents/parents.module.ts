import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth';
import { DatabaseModule } from '../../database/database.module';
import { ParentsController } from './parents.controller';
import { ParentsService } from './parents.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [ParentsController],
  providers: [ParentsService],
  exports: [ParentsService],
})
export class ParentsModule {}
