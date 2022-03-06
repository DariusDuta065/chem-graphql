import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Group } from 'src/group/group.entity';
import { Role } from 'src/auth/enums/role.enum';

@ObjectType()
export class UserOutput {
  @Field(() => Int)
  public id: number;

  @Field()
  public email: string;

  @Field()
  public firstName: string;

  @Field()
  public lastName: string;

  @Field(() => Role)
  public role: Role;

  @Field(() => Group, { nullable: true })
  public group?: Group;
}
