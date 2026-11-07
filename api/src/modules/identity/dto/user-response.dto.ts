export class UserResponseDto {
  authProvider: 'google' | 'password';
  id: number;
  username: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  role: string;
  status: string;
  createdAt: string;
}
