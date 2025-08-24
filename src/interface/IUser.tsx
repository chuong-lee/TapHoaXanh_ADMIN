export interface User {
  id?: number;
  name: string;

  phone: string;

  image: string;

  role: TUserRole;

  email: string;
}

export enum TUserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export const defaultUser = {
  name: "",
  phone: "",
  image: "",
  role: TUserRole.USER,
  email: "",
};
