import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Group {
  @Field()
  @PrimaryGeneratedColumn()
  public id: number;

  @Field()
  @Column({ type: 'tinyint' })
  public grade: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public notes: string;

  @Field()
  @Column({ type: 'tinyint' })
  public scheduleDay: number;

  @Field()
  @Column({ type: 'tinyint' })
  public scheduleHour: number;

  @Field()
  @Column({ type: 'tinyint' })
  public scheduleMinute: number;
}
