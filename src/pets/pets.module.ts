import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';

import { OwnersModule } from '../owners/owners.module';
import { PetsResolver } from './pets.resolver';
import { PetsService } from './pets.service';
import { Pet } from './pet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pet]), forwardRef(() => OwnersModule)],
  providers: [PetsService, PetsResolver],
  exports: [PetsService],
})
export class PetsModule {}
