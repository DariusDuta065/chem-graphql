import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../user.entity';

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
  id: number;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  role: string;

  static fromUser(user: User) {
    return new UserData({
      id: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.toLowerCase(),
    });
  }
}
