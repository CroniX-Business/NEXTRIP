import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import * as jwt from 'jsonwebtoken';
import { environment } from 'environments/environment';

@Injectable()
export class AuthService {
  private readonly jwtSecret = environment.jwtToken;

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<string> {
    const user = new this.userModel({ username, email, password });
    await user.save();
    return this.jwtSecret;
  }

  async login(email: string, password: string): Promise<string | null> {
    const user = await this.userModel.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      return this.jwtSecret;
    }
    return null;
  }

  private createToken(userId: Types.ObjectId): string {
    return jwt.sign({ id: userId }, this.jwtSecret, { expiresIn: '1h' });
  }
}
