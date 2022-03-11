import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Group } from '../group/group.entity';

@Entity()
@ObjectType()
export class Content {
  @Field()
  @PrimaryGeneratedColumn()
  public id: number;

  @Field()
  @Column({ type: 'uuid', unique: true })
  public blockID: string;

  @Field()
  @Column()
  public title: string;

  @Field()
  @Column()
  public type: string;

  @Field()
  @Column({ type: 'datetime' })
  public lastEditedAt: Date;

  @Field(() => [GraphQLJSONObject])
  @Column({ type: 'longtext' })
  public blocks: string;

  @Field(() => [Group], { nullable: true })
  @ManyToMany(() => Group, (group) => group.contents, { onDelete: 'CASCADE' })
  public groups?: Promise<Group[]>;
}
