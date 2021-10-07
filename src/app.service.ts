import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getPets(): Promise<string[]> {
    return ['Hey', 'Good day'];
  }
}
