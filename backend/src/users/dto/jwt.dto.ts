export interface JwtUserPayload {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  role?: string | null;
  online: boolean;
  password: string; // có trong DB nhưng sẽ omit khi trả client
}
