import { Field, InputType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

@InputType()
export class CreateGroupInput {
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
}
