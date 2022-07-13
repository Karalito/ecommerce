import { omit } from 'lodash';
import mongoose, { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import User, { UserDocument, UserInput } from '../models/user.model';

class UserService {
  public users = User;

  public createUser = async (input: UserInput) => {
    try {
      const user = await this.users.create(input);

      return omit(user.toJSON(), ['password']);
    } catch (e: any) {
      throw new Error(e);
    }
  };

  /**
   * @method validatePassword
   * @param param0
   * @returns False if User doesn't exist or password is invalid
   * @returns User object without password if User exists and password is correct
   * @description Method to validate users password, method takes object and destructure it to get email and password
   */
  public validatePassword = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      const user = await this.users.findOne({ email });

      if (!user) return false;

      const isValid = await user.comparePassword(password);
      if (!isValid) return false;

      return omit(user.toJSON(), ['password']);
    } catch (e: any) {
      throw new Error(e);
    }
  };

  public findUser = async (query: FilterQuery<UserDocument>) => {
    console.log(query);

    if (mongoose.isValidObjectId(query._id)) {
      const user = await this.users.findOne(query);

      if (user) return omit(user.toJSON(), ['password']);
    }
    return null;
  };

  public getAllUsers = async (
    query: FilterQuery<UserDocument>,
    options: QueryOptions = { lean: true }
  ) => {
    return await this.users.find(query, {}, options).select('-password');
  };

  public updateUserById = async (
    query: FilterQuery<UserDocument>,
    update: UpdateQuery<UserInput>,
    options: QueryOptions
  ) => {
    return await this.users.findByIdAndUpdate(query, update, options);
  };

  public deleteUserById = async (query: FilterQuery<UserDocument>) => {
    return await this.users.findByIdAndDelete(query);
  };
}

export default UserService;
