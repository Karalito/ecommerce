import mongoose from 'mongoose';
import User, { userRole } from '../models/user.model';

/**
 * User data
 */
export const userId = new mongoose.Types.ObjectId().toString();
export const userIdNew = new mongoose.Types.ObjectId().toString();

export const userPayload = {
  _id: userId,
  name: 'Tester',
  surname: 'Test',
  email: 'test@gmail.com',
};

export const userInput = {
  name: 'Tester',
  surname: 'Test',
  email: 'test@gmail.com',
  password: 'abcd1234',
  passwordConfirmation: 'abcd1234',
};

export const staffUserPayload = {
  _id: userId,
  name: 'Staff',
  surname: 'Test',
  email: 'staff@gmail.com',
  userType: userRole.staff,
  password: 'abcd1234',
  passwordConfirmation: 'abcd1234',
};

export const adminUserPayload = {
  _id: userIdNew,
  name: 'Admin',
  surname: 'Test',
  email: 'admin@gmail.com',
  userType: userRole.admin,
  password: 'abcd1234',
  passwordConfirmation: 'abcd1234',
};

export const updateUserPayload = {
  name: 'NewName',
  surname: 'NewSurname',
  email: 'updatedemail@gmail.com',
  userType: userRole.staff,
  password: '1234abcd',
  passwordConfirmation: '1234abcd',
};

export function createUser(payload: any) {
  return User.create(payload);
}
/**
 * Product data
 */

export const productPayload = {
  user: userId,
  title: 'Node Js Book',
  description:
    'A book about learning node js in depth. In this book you can learn about design patterns, how node works inside and other cool stuff!',
  price: 50.99,
  qty: 10,
  image:
    'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1541489138l/42643290._SY475_.jpg',
};

export const updatedProductPayload = {
  user: userIdNew,
  title: 'Typescript course',
  description:
    'A course about learning typescript, how to migrate project from javascript to typescript, etc.',
  price: 10.27,
  qty: 55,
  image: 'test_url',
};

export const productFieldsRequired = [
  {
    'code': 'invalid_type',
    'expected': 'string',
    'message': 'Title field is required',
    'path': ['body', 'title'],
    'received': 'undefined',
  },
  {
    'code': 'invalid_type',
    'expected': 'string',
    'message': 'Description is required',
    'path': ['body', 'description'],
    'received': 'undefined',
  },
  {
    'code': 'invalid_type',
    'expected': 'number',
    'message': 'Price is required',
    'path': ['body', 'price'],
    'received': 'undefined',
  },
  {
    'code': 'invalid_type',
    'expected': 'number',
    'message': 'Quantity is required',
    'path': ['body', 'qty'],
    'received': 'undefined',
  },
  {
    'code': 'invalid_type',
    'expected': 'string',
    'message': 'Image is Required',
    'path': ['body', 'image'],
    'received': 'undefined',
  },
];
/**
 * Session data
 */

export const sessionPayload = {
  _id: new mongoose.Types.ObjectId().toString(),
  user: userId,
  valid: true,
  userAgent: 'insomnia/2022.4.2',
  createdAt: '2022-07-09T07:16:51.986Z',
  updatedAt: '2022-07-09T07:16:51.986Z',
  __v: 0,
};
