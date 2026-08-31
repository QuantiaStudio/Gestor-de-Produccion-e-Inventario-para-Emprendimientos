export type UserRole = 'Administrator' | 'Operator';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
}

export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

export interface UpdateUserDTO {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}
