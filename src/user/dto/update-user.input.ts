import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsInt,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field()
  @IsInt()
  public id: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  public email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  @IsString()
  public firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  public lastName?: string;
}
