import { Field, ObjectType } from '@nestjs/graphql';
import { UserData } from '../../users/dto/userData.output';

@ObjectType()
export class TokenOutput {
  @Field()
  token: string;

  @Field(() => UserData, { nullable: true })
  userData?: UserData;

  static fromToken({ token }: { token: string }) {
    const tokenData = new TokenOutput();
    tokenData.token = token;
    return tokenData;
  }
}
