import {
  IsAlphanumeric,
  IsEmail,
  IsEnum,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'src/auth/enums/role.enum';

export class CreateUserInput {
  @MinLength(3)
  @MaxLength(50)
  @IsEmail()
  email: string;

  @MinLength(3)
  @MaxLength(20)
  @IsAlphanumeric()
  password: string;

  @MinLength(3)
  @MaxLength(30)
  @IsAlphanumeric()
  firstName: string;

  @MinLength(3)
  @MaxLength(30)
  @IsAlphanumeric()
  lastName: string;

  @IsEnum(Role)
  role: Role;
}
