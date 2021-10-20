import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { Pet } from './pet.entity';
import { Owner } from '../owners/owner.entity';
import { OwnersService } from '../owners/owners.service';
import { CreatePetInput } from './dto/create-pet.input';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet) private petsRepository: Repository<Pet>,

    @Inject(forwardRef(() => OwnersService))
    private ownersService: OwnersService,
  ) {}

  findAll(): Promise<Pet[]> {
    return this.petsRepository.find();
  }

  findOne(id: number): Promise<Pet> {
    return this.petsRepository.findOneOrFail(id);
  }

  findByOwner(ownerId: number): Promise<Pet[]> {
    return this.petsRepository.find({
      where: {
        ownerId,
      },
    });
  }

  createPet(createPetInput: CreatePetInput): Promise<Pet> {
    const newPet = this.petsRepository.create(createPetInput);
    return this.petsRepository.save(newPet);
  }

  getOwner(ownerId: number): Promise<Owner> {
    return this.ownersService.findOne(ownerId);
  }
}
