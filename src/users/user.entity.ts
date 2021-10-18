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
  email: string;

  @Column({ nullable: false })
  @Field()
  password: string;

  @Column({ nullable: false })
  @Field()
  firstName: string;

  @Column({ nullable: false })
  @Field()
  lastName: string;
}
