import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserData {
  @Field(() => Int)
  userId: number;

  @Field()
  username: string;
}
