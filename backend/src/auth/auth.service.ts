import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import * as jwt from 'jsonwebtoken';
import { environment } from 'environments/environment';

@Injectable()
export class AuthService {
  private readonly jwtSecret = environment.JWT_TOKEN;

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<string> {
    try {
      const existingUser = await this.userModel.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      const user = new this.userModel({ username, email, password });
      await user.validate();
      await user.save();

      return this.createToken(user._id as Types.ObjectId);
    } catch (error) {
      Logger.error('Failed to register user', error.stack);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(email: string, password: string): Promise<string | null> {
    const user = await this.userModel.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      return this.createToken(user._id as Types.ObjectId);
    }
    return null;
  }

  private createToken(userId: Types.ObjectId): string {
    return jwt.sign({ id: userId }, this.jwtSecret, { expiresIn: '1h' });
  }

  async getUserFromToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { id: string };
      return await this.userModel.findById(decoded.id).exec();
    } catch (error) {
      return null;
    }
  }
}
