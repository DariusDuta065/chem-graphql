import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class User {
  //

  @PrimaryGeneratedColumn()
  @Field(() => Int)
  userId: number;

  @Column({ nullable: false })
  @Field()
  username: string;

  @Column({ nullable: false })
  @Field()
  password: string;
}
