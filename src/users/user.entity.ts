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
  public userId: number;

  @Column({ nullable: false })
  @Field()
  public email: string;

  @Column({ nullable: false })
  @Field()
  public password: string;

  @Column({ nullable: false })
  @Field()
  public firstName: string;

  @Column({ nullable: false })
  @Field()
  public lastName: string;

  @Column({
    type: 'enum',
    enum: Role,
    nullable: false,
    default: Role.User,
  })
  @Field(() => Role)
  public role: Role;
}
