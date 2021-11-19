import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, Matches } from 'class-validator';
import { Role } from '../enums/role.enum';

@InputType()
export class UserRegisterInput {
  @Field()
  @IsEmail()
  public email: string;

  @Field()
  @Matches(/^[a-z ]+$/i)
  public firstName: string;

  @Field()
  @Matches(/^[a-z ]+$/i)
  public lastName: string;

  public role?: Role = Role.User;
  public password?: string;
}
