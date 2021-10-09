import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LoginUserOutput {
  @Field()
  token: string;

  @Field()
  username: string;
}
