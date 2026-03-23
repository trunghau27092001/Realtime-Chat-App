import type { User } from "./user";

export interface authState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;

  setAccessToken: (accessToken: string) => void;
  clearState: () => void;
  signUp: (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
  ) => Promise<boolean>;
  signIn: (username: string, password: string) => Promise<boolean>;

  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
