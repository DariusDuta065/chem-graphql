import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserData {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;
}
