import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';

import { User } from '../user/user.entity';
import { Content } from '../content/content.entity';

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

  @Field(() => [User], { nullable: true })
  @OneToMany(() => User, (user) => user.group, { nullable: true })
  public users?: Promise<User[]>;

  @Field(() => [Content], { nullable: true })
  @ManyToMany(() => Content, (content) => content.groups)
  @JoinTable({ name: 'group_content' })
  public contents?: Promise<Content[]>;
}
