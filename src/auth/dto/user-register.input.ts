import { Field, InputType } from '@nestjs/graphql';
import { IsAlpha, IsEmail } from 'class-validator';
import { Role } from '../enums/role.enum';

@InputType()
export class UserRegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsAlpha()
  firstName: string;

  @Field()
  @IsAlpha()
  lastName: string;

  role?: Role = Role.User;
  password?: string;
}
