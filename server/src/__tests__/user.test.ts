import supertest from 'supertest';
import App from '../app';
import { UserRoutes, SessionRoutes } from '../routes';
import mongoose from 'mongoose';
import {
  adminUserPayload,
  createUser,
  staffUserPayload,
  updateUserPayload,
  userInput,
} from './data';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.useRealTimers();

describe('user', () => {
  const app = new App([new UserRoutes(), new SessionRoutes()]);

  beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let connection of collections) {
      await connection.deleteMany({});
    }
  });
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });
  describe('user registration route', () => {
    describe('given the user data is valid', () => {
      it('should return the status code 201 and created user', async () => {
        const { body, statusCode } = await supertest(app.getServer())
          .post('/api/users/')
          .send(userInput);

        expect(statusCode).toBe(201);
        expect(body.data).toEqual({
          _id: expect.any(String),
          __v: 0,
          createdAt: expect.any(String),
          email: 'test@gmail.com',
          name: 'Tester',
          surname: 'Test',
          updatedAt: expect.any(String),
          userType: 'user',
        });
        expect(body.message).toEqual('User created Successfully!');
      });
    });

    describe('given the passwords do not match', () => {
      it('should return status code 400', async () => {
        const { body, statusCode } = await supertest(app.getServer())
          .post('/api/users/')
          .send({ ...userInput, passwordConfirmation: 'doesntmatch' });

        expect(statusCode).toBe(400);
        expect(body[0].message).toEqual('Passwords do not match');
      });
    });

    describe('given the user service throws', () => {
      it('should return status code 409', async () => {
        await supertest(app.getServer()).post('/api/users/').send(userInput);

        const { statusCode } = await supertest(app.getServer())
          .post('/api/users/')
          .send(userInput);

        expect(statusCode).toBe(409);
      });
    });
  });

  describe('user session route', () => {
    describe('given the email and password are valid', () => {
      it('should return a signed access token and refresh token', async () => {
        await supertest(app.getServer()).post('/api/users/').send(userInput);

        const { body, statusCode } = await supertest(app.getServer())
          .post('/api/sessions')
          .send({ email: 'test@gmail.com', password: 'abcd1234' });

        expect(statusCode).toBe(201);
        expect(body).toEqual({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        });
      });
    });
  });

  describe('user get route', () => {
    describe('given the user does not exist', () => {
      it('should return status code 404', async () => {
        const userId = 'nonexistent_userid';

        const { statusCode } = await supertest(app.getServer()).get(
          `/api/users/${userId}`
        );

        expect(statusCode).toBe(404);
      });
    });

    describe('given the user does exist', () => {
      it('should return status code 200 and a user', async () => {
        const user = await createUser(staffUserPayload);

        const { body, statusCode } = await supertest(app.getServer()).get(
          `/api/users/${user._id}`
        );

        expect(statusCode).toBe(200);
        expect(body.data._id).toEqual(user._id.toString());
      });
    });
  });

  describe('user update route', () => {
    describe('given the user is not logged in', () => {
      describe('given the user does not exist', () => {
        it('should return status code 401', async () => {
          const { statusCode } = await supertest(app.getServer())
            .put('/api/users/user_random')
            .send(updateUserPayload);

          expect(statusCode).toBe(401);
        });
      });

      describe('given the user does exist', () => {
        it('should return status code 401', async () => {
          const user = await createUser(userInput);
          const { statusCode } = await supertest(app.getServer())
            .put(`/api/users/${user._id}`)
            .send(updateUserPayload);

          expect(statusCode).toBe(401);
        });
      });
    });

    describe('given the user is logged in', () => {
      describe('given the user is not admin or the user who matches id of edit user', () => {
        it('should return status code 401', async () => {
          const user = await createUser(adminUserPayload);
          await createUser(userInput);
          const res = await supertest(app.getServer())
            .post('/api/sessions')
            .send({ email: 'test@gmail.com', password: 'abcd1234' });

          const { statusCode } = await supertest(app.getServer())
            .put(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${res.body.accessToken}`)
            .send(updateUserPayload);

          expect(statusCode).toBe(401);
        });
      });

      describe('given the user is not admin but the one who matches id edit user', () => {
        it('should return status code 200 and updated user payload', async () => {
          const user = await createUser(staffUserPayload);

          const res = await supertest(app.getServer())
            .post('/api/sessions')
            .send({ email: 'staff@gmail.com', password: 'abcd1234' });

          const { body, statusCode } = await supertest(app.getServer())
            .put(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${res.body.accessToken}`)
            .send(updateUserPayload);

          expect(statusCode).toBe(200);
          expect(body.data).not.toEqual({
            ...staffUserPayload,
            updatedAt: expect.any(String),
          });
          expect(body.data.updatedAt).not.toEqual(user.updatedAt);
        });
      });

      describe('given the user is admin but not the one who matches id edit user', () => {
        it('should return status code 200 and updated user payload', async () => {
          const user = await createUser(staffUserPayload);
          await createUser(adminUserPayload);
          const res = await supertest(app.getServer())
            .post('/api/sessions')
            .send({ email: 'admin@gmail.com', password: 'abcd1234' });

          const { body, statusCode } = await supertest(app.getServer())
            .put(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${res.body.accessToken}`)
            .send(updateUserPayload);

          expect(statusCode).toBe(200);
          expect(body.data).not.toEqual({
            ...staffUserPayload,
            updatedAt: expect.any(String),
          });
          expect(body.data.updatedAt).not.toEqual(user.updatedAt);
        });
      });

      describe('given the user is admin but edit user does not exist', () => {
        it('should return status code 404', async () => {
          await createUser(adminUserPayload);
          const res = await supertest(app.getServer())
            .post('/api/sessions')
            .send({ email: 'admin@gmail.com', password: 'abcd1234' });

          const { statusCode } = await supertest(app.getServer())
            .put(`/api/users/user_random_id`)
            .set('Authorization', `Bearer ${res.body.accessToken}`)
            .send(updateUserPayload);

          expect(statusCode).toBe(404);
        });
      });

      describe('given the user is admin but update payload is empty', () => {
        it(' should return status code 400 and required fields', async () => {
          const user = await createUser(staffUserPayload);
          await createUser(adminUserPayload);
          const res = await supertest(app.getServer())
            .post('/api/sessions')
            .send({ email: 'admin@gmail.com', password: 'abcd1234' });

          const { body, statusCode } = await supertest(app.getServer())
            .put(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${res.body.accessToken}`)
            .send();

          expect(statusCode).toBe(400);
          expect(body).toEqual([
            {
              'code': 'invalid_type',
              'expected': 'string',
              'message': 'Name field is required.',
              'path': ['body', 'name'],
              'received': 'undefined',
            },
            {
              'code': 'invalid_type',
              'expected': 'string',
              'message': 'Surname field is required.',
              'path': ['body', 'surname'],
              'received': 'undefined',
            },
            {
              'code': 'invalid_type',
              'expected': 'string',
              'message': 'Email is required',
              'path': ['body', 'email'],
              'received': 'undefined',
            },
            {
              'code': 'invalid_type',
              'expected': 'string',
              'message': 'Password field is required.',
              'path': ['body', 'password'],
              'received': 'undefined',
            },
            {
              'code': 'invalid_type',
              'expected': 'string',
              'message': 'Password field is required.',
              'path': ['body', 'passwordConfirmation'],
              'received': 'undefined',
            },
          ]);
        });
      });
    });
  });
  describe('user delete route', () => {
    describe('given the user is not logged in', () => {
      it('should return status code 401', async () => {
        const { statusCode } = await supertest(app.getServer()).delete(
          '/api/users/random_id'
        );

        expect(statusCode).toBe(401);
      });
    });

    describe('given the user is logged in', () => {
      describe('given the user is not admin', () => {
        it('should return status code 401', async () => {
          const user = await createUser(staffUserPayload);
          await createUser(userInput);

          const res = await supertest(app.getServer())
            .post('/api/sessions')
            .send({ email: 'test@gmail.com', password: 'abcd1234' });

          const { statusCode } = await supertest(app.getServer())
            .delete(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${res.body.accessToken}`);

          expect(statusCode).toBe(401);
        });
      });

      describe('given the user is admin', () => {
        it('should return status code 204', async () => {
          const user = await createUser(userInput);
          await createUser(adminUserPayload);

          const res = await supertest(app.getServer())
            .post('/api/sessions')
            .send({ email: 'admin@gmail.com', password: 'abcd1234' });

          const { statusCode } = await supertest(app.getServer())
            .delete(`/api/users/${user._id}`)
            .set('Authorization', `Bearer ${res.body.accessToken}`);

          expect(statusCode).toBe(204);
        });
      });
    });
  });
});
