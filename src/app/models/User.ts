export class User {
    public _id: number;
    public role: string;
    public username: string;
    public email: string;
    public password: string;
    public firstName: string;
    public lastName: string;
    public tokens: number;
  
    public constructor(id: number, role: string, username: string, email: string, password: string, firstName: string, lastName: string, tokens: number ) {
      this._id = id;
      this.role = role;
      this.username = username;
      this.email = email;
      this.password = password;
      this.firstName = firstName;
      this.lastName = lastName;
      this.tokens = tokens;
    }
  }
  