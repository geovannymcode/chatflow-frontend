export interface User {
  id: string;
  email: string;
  username: string;
  hasVerifiedEmail: boolean;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface UserProfile extends User {
  bio: string | null;
  lastSeenAt: string | null;
}