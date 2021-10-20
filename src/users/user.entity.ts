import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Role } from '../auth/enums/role.enum';

registerEnumType(Role, {
  name: 'UserRole',
});

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

  @Column({
    type: 'enum',
    enum: Role,
    nullable: false,
    default: Role.User,
  })
  @Field(() => Role)
  role: Role;
}
