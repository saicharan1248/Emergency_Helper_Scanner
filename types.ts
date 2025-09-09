
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profession: string;
  organization?: string;
  skills: string;
  experience?: number;
  bio?: string;
  createdAt: string;
}

export type UserData = Omit<User, 'id' | 'createdAt'>;
