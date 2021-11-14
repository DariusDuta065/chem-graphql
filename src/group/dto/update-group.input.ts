import { Field, InputType } from '@nestjs/graphql';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

@InputType()
export class UpdateGroupInput {
  @Field()
  @IsNumber()
  public id: number;

  @Field()
  @Min(11)
  @Max(13)
  @IsNumber()
  public grade: number;

  @Field({ nullable: true, defaultValue: null })
  @IsOptional()
  @IsString()
  public notes: string;

  @Field()
  @Min(0)
  @Max(6)
  @IsNumber()
  public scheduleDay: number;

  @Field()
  @Min(0)
  @Max(23)
  @IsNumber()
  public scheduleHour: number;

  @Field()
  @Min(0)
  @Max(59)
  @IsNumber()
  public scheduleMinute: number;

  @Field(() => [Number], { nullable: true })
  @IsOptional()
  @IsPositive({ each: true })
  @IsInt({ each: true })
  public users?: number[];

  @Field(() => [Number], { nullable: true })
  @IsOptional()
  @IsPositive({ each: true })
  @IsInt({ each: true })
  public contents?: number[];
}
