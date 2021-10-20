import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';

import { OwnersResolver } from './owners.resolver';
import { OwnersService } from './owners.service';
import { Owner } from './owner.entity';

import { PetsModule } from '../pets/pets.module';

@Module({
  imports: [TypeOrmModule.forFeature([Owner]), forwardRef(() => PetsModule)],
  providers: [OwnersResolver, OwnersService],
  exports: [OwnersService],
})
export class OwnersModule {}
