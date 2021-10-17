import { IsAlphanumeric, MaxLength, MinLength } from 'class-validator';

export class CreateUserInput {
  @MinLength(3)
  @MaxLength(20)
  @IsAlphanumeric()
  username: string;

  @MinLength(3)
  @MaxLength(20)
  @IsAlphanumeric()
  password: string;
}
