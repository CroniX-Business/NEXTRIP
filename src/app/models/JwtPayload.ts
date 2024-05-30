export class JwtPayload {
    public expires_at: number;
  
    public constructor(expires_at: number) {
      this.expires_at = expires_at;
    }
  }