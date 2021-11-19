import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/user.entity';

@ObjectType()
export class UserData {
  constructor({ id, email, firstName, lastName, role }) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
  }

  @Field(() => Int)
  public id: number;

  @Field()
  public email: string;

  @Field()
  public firstName: string;

  @Field()
  public lastName: string;

  @Field()
  public role: string;

  public static fromUser(user: User): UserData {
    return new UserData({
      id: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.toLowerCase(),
    });
  }
}
