// import { Prop, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';
// import * as bcrypt from 'bcryptjs';

// @Schema()
// export class User extends Document {
//   @Prop({ required: true, unique: true, default: 'user' })
//   role: string;

//   @Prop({ required: true, unique: true })
//   username: string;

//   @Prop({ required: true, unique: true })
//   email: string;

//   @Prop({ required: true })
//   password: string;

//   @Prop({ required: false, default: '' })
//   firstName: string;

//   @Prop({ required: false, default: '' })
//   lastName: string;

//   @Prop({ required: true, default: 5 })
//   tokens: number;

//   @Prop({
//     type: [
//       {
//         places: [{ type: Schema.Types.ObjectId, ref: 'Place' }] // Reference to Place documents
//       }
//     ],
//     default: []
//   })
//   trips: {
//     places: Schema.Types.ObjectId[]; // Array of Place document references
//   }[];

//   async comparePassword(enteredPassword: string): Promise<boolean> {
//     return bcrypt.compare(enteredPassword, this.password);
//   }
// }

import * as bcrypt from 'bcryptjs';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Place } from 'generator/generator.dto';

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

  @Prop({
    type: [
      {
        tripId: {
          type: Types.ObjectId,
          default: () => new Types.ObjectId(),
        },
        tripName: { type: String, required: true, unique: true },
        places: [{ type: MongooseSchema.Types.Mixed }],
        timeSaved: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  trips: {
    tripId: Types.ObjectId;
    tripName: string;
    places: Place[];
    timeSaved: Date;
  }[];

  async comparePassword(enteredPassword: string): Promise<boolean> {
    return bcrypt.compare(enteredPassword, this.password);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.comparePassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
