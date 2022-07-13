import { object, string, TypeOf } from 'zod';

export const createUserSchema = object({
  body: object({
    name: string({
      required_error: 'Name field is required.',
    }),
    surname: string({
      required_error: 'Surname field is required.',
    }),
    email: string({
      required_error: 'Email is required',
    }).email('Invalid email.'),
    password: string({
      required_error: 'Password field is required.',
    }).min(8, 'Password is too short, must be at least 8 characters long.'),
    passwordConfirmation: string({
      required_error: 'Password field is required.',
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  }),
});

const updateUserPayload = {
  body: object({
    name: string({
      required_error: 'Name field is required.',
    }),
    surname: string({
      required_error: 'Surname field is required.',
    }),
    email: string({
      required_error: 'Email is required',
    }).email('Invalid email.'),
    password: string({
      required_error: 'Password field is required.',
    }).min(8, 'Password is too short, must be at least 8 characters long.'),
    passwordConfirmation: string({
      required_error: 'Password field is required.',
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  }),
};

const params = {
  params: object({
    userId: string({
      required_error: 'User id is required',
    }),
  }),
};

export const getUserSchema = object({
  ...params,
});

export const updateUserSchema = object({
  ...updateUserPayload,
  ...params,
});

export const deleteUserSchema = object({
  ...params,
});

// Interfaces for input
export type CreateUserInput = Omit<
  TypeOf<typeof createUserSchema>,
  'body.passwordConfirmation'
>;
export type ReadUserInput = TypeOf<typeof getUserSchema>;
export type UpdateUserInput = TypeOf<typeof updateUserSchema>;
export type DeleteUserInput = TypeOf<typeof deleteUserSchema>;
