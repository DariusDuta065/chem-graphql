import { Field, ObjectType } from '@nestjs/graphql';
import { UserData } from '../../users/dto/userData.output';

@ObjectType()
export class TokenOutput {
  @Field()
  accesstoken: string;

  @Field({ nullable: true })
  refreshToken?: string;

  @Field(() => UserData, { nullable: true })
  userData?: UserData;

  static fromTokens({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken?: string;
  }) {
    const tokenData = new TokenOutput();
    tokenData.accesstoken = accessToken;
    tokenData.refreshToken = refreshToken;
    return tokenData;
  }
}
