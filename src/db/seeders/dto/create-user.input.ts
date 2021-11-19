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
  public email: string;

  @MinLength(3)
  @MaxLength(30)
  @IsAlphanumeric()
  public firstName: string;

  @MinLength(3)
  @MaxLength(30)
  @IsAlphanumeric()
  public lastName: string;

  @IsEnum(Role)
  public role: Role;

  @MinLength(3)
  @MaxLength(20)
  @IsAlphanumeric()
  public password: string;
}
