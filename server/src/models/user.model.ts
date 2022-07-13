import { Schema, model, Document } from 'mongoose';
import { compare, genSalt, hashSync } from 'bcrypt';
import config from 'config';

export enum userRole {
  admin = 'admin',
  staff = 'staff',
  user = 'user',
}

export interface UserInput {
  email: string;
  name: string;
  surname: string;
  password: string;
}

export interface UserDocument extends UserInput, Document {
  userType: userRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(pass: string): Promise<boolean>;
}

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    password: { type: String, required: true },
    userType: {
      type: String,
      enum: Object.values(userRole),
      default: userRole.user,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  let user = this;

  if (!user.isModified('password')) return next();

  const salt = await genSalt(config.get<number>('saltWorkFactor'));

  const hashedPassword = await hashSync(user.password, salt);

  user.password = hashedPassword;

  return next();
});

userSchema.methods.comparePassword = async function (
  pass: string
): Promise<boolean> {
  const user = this;

  return compare(pass, user.password).catch(() => false);
};
const User = model<UserDocument>('User', userSchema);

export default User;
