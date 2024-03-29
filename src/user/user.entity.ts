import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Group } from 'src/group/group.entity';
import { Role } from 'src/auth/enums/role.enum';

registerEnumType(Role, {
  name: 'UserRole',
});

@Entity()
@ObjectType()
export class User {
  //

  @PrimaryGeneratedColumn()
  @Field(() => Int)
  public id: number;

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

  @ManyToOne(() => Group, (group) => group.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Field(() => Group, { nullable: true })
  public group?: Promise<Group>;
}
