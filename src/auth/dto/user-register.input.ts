import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, Matches } from 'class-validator';
import { Role } from '../enums/role.enum';

@InputType()
export class UserRegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Matches(/^[a-z ]+$/i)
  firstName: string;

  @Field()
  @Matches(/^[a-z ]+$/i)
  lastName: string;

  role?: Role = Role.User;
  password?: string;
}
