export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  isVerified: boolean;
}

export interface UserProfile extends User {
  bio: string | null;
  lastSeenAt: string | null;
}