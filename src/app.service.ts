import { Injectable } from '@nestjs/common';
import { Pet, PetsDTO } from './app.types';

@Injectable()
export class AppService {
  async getPets(): Promise<PetsDTO> {
    //

    const delayPromise: (ms: number) => Promise<Pet[]> = (ms) =>
      new Promise((resolve) => {
        setTimeout(() => {
          console.log('Resolving now');

          resolve([
            { name: 'Rex', age: 2 },
            { name: 'Coco', age: 1 },
          ]);
        }, ms);
      });

    const pets: Pet[] = await delayPromise(100);
    return { pets, count: pets.length };
  }
}
