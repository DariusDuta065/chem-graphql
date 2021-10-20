import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { Owner } from './owner.entity';
import { PetsService } from '../pets/pets.service';
import { CreateOwnerInput } from './dto/create-owner.input';
import { UpdateOwnerInput } from './dto/update-owner.input';

@Injectable()
export class OwnersService {
  constructor(
    @InjectRepository(Owner) private ownersRepository: Repository<Owner>,
    @Inject(forwardRef(() => PetsService))
    private petsService: PetsService,
  ) {}

  create(createOwnerInput: CreateOwnerInput) {
    const newOwner = this.ownersRepository.create(createOwnerInput);

    return this.ownersRepository.save(newOwner);
  }

  findAll() {
    return this.ownersRepository.find();
  }

  findOne(id: number) {
    return this.ownersRepository.findOneOrFail(id);
  }

  findPets(ownerId: number) {
    return this.petsService.findByOwner(ownerId);
  }

  update(id: number, updateOwnerInput: UpdateOwnerInput) {
    return `This action updates a #${id} owner`;
  }

  remove(id: number) {
    return `This action removes a #${id} owner`;
  }
}
