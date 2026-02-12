export interface AppUser {
  id: string;
  name: string;
  whatsapp: string;
  countryCode: string;
  dob: string;
  plan: string;
  memberSince: string;
}

export interface AuthState {
  token: string | null;
  user: AppUser | null;
  isAuthenticated: boolean;
  isAdult: boolean;
}
