import { Role } from '../enums/role.enum';

export class UserRegisterOutput {
  userId: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}
