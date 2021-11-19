import { Field, ObjectType } from '@nestjs/graphql';
import { UserData } from 'src/user/dto/user-data.output';

@ObjectType()
export class TokenOutput {
  @Field()
  public accesstoken: string;

  @Field({ nullable: true })
  public refreshToken?: string;

  @Field(() => UserData, { nullable: true })
  public userData?: UserData;

  public static fromTokens({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken?: string;
  }): TokenOutput {
    const tokenData = new TokenOutput();
    tokenData.accesstoken = accessToken;
    tokenData.refreshToken = refreshToken;
    return tokenData;
  }
}
