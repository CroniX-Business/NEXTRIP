export interface User {
  _id: string;
  role: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tokens: number;
}
