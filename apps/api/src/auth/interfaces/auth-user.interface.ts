export type AuthUser = {
  sub: string;
  email: string;
  name?: string;
  provider: string;
  providerId?: string;
  picture?: string;
};
