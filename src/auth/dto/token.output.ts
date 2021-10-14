import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenOutput {
  @Field()
  token: string;

  @Field()
  username: string;

  static fromUser({ token, username }: { token: string; username: string }) {
    const tokenData = new TokenOutput();
    tokenData.token = token;
    tokenData.username = username;
    return tokenData;
  }
}
