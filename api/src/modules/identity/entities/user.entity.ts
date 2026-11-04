export class UserEntity {
  id: number;
  username: string;
  fullName: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  bio?: string;
  role: 'ADMIN' | 'STAFF' | 'USER';
  status: 'ACTIVE' | 'LOCKED' | 'PENDING';
  createdAt: Date;
}
