import * as bcrypt from 'bcryptjs';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Place } from 'generator/generator.dto';

@Schema()
export class Trip {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  tripId: Types.ObjectId;

  @Prop({ type: String, required: true })
  tripName: string;

  @Prop({ type: [MongooseSchema.Types.Mixed] })
  places: Place[];

  @Prop({ type: String })
  comment: string;

  @Prop({ type: Boolean, default: false })
  public: boolean;

  @Prop({ type: Number })
  likes: number;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  likedBy: Types.ObjectId[];

  @Prop({ type: Date, default: Date.now })
  timeSaved: Date;
}

export const TripSchema = SchemaFactory.createForClass(Trip);

@Schema()
export class User extends Document {
  @Prop({ required: true, default: 'user' })
  role: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, default: '' })
  firstName: string;

  @Prop({ required: false, default: '' })
  lastName: string;

  @Prop({ required: true, default: 5 })
  tokens: number;

  @Prop({ type: [TripSchema], default: [] })
  trips: Trip[];

  async comparePassword(enteredPassword: string): Promise<boolean> {
    return bcrypt.compare(enteredPassword, this.password);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};
