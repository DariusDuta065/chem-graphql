import { Field, InputType } from '@nestjs/graphql';
import { IsAlphanumeric } from 'class-validator';

@InputType()
export class LoginUserInput {
  @IsAlphanumeric()
  @Field()
  username: string;

  @IsAlphanumeric()
  @Field()
  password: string;
}
