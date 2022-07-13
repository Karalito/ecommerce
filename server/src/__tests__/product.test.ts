import supertest from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import App from '../app';
import { ProductRoutes } from '../routes';
import { signJWT } from '../utils/jwt.utils';
import {
  userPayload,
  productPayload,
  productFieldsRequired,
  staffUserPayload,
  adminUserPayload,
  updatedProductPayload,
  createUser,
} from './data';
import mongoose from 'mongoose';
jest.useRealTimers();

const app = new App([new ProductRoutes()]);

describe('product', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });
  describe('product get route', () => {
    describe('given the product does not exist', () => {
      it('should return status code 404', async () => {
        const productId = 'product-notexistent1';

        const { statusCode } = await supertest(app.getServer()).get(
          `/api/products/${productId}`
        );

        expect(statusCode).toBe(404);
      });
    });

    describe('given the product does exist', () => {
      it('should return status code 200 and a product', async () => {
        const productRoute = new ProductRoutes();
        const products = productRoute.productController.productService;
        const product = await products.createProduct(productPayload);

        const { body, statusCode } = await supertest(app.getServer()).get(
          `/api/products/${product.productId}`
        );

        expect(statusCode).toBe(200);
        expect(body.data.productId).toBe(product.productId);
      });
    });
  });

  describe('product create route', () => {
    describe('given the user is not logged in', () => {
      it('should return status code 401', async () => {
        const { statusCode } = await supertest(app.getServer())
          .post('/api/products/')
          .send(productPayload);

        expect(statusCode).toBe(401);
      });
    });

    describe('given the user is logged in is not staff or admin', () => {
      it('should return status code 401', async () => {
        const jwt = signJWT(userPayload);

        const { statusCode } = await supertest(app.getServer())
          .post('/api/products/')
          .set('Authorization', `Bearer ${jwt}`)
          .send(productPayload);

        expect(statusCode).toBe(401);
      });
    });
    describe('given the user is logged in and is staff', () => {
      it('should return status code 201 and created product', async () => {
        await createUser(staffUserPayload);
        const jwt = signJWT(staffUserPayload);

        const { body, statusCode } = await supertest(app.getServer())
          .post('/api/products/')
          .set('Authorization', `Bearer ${jwt}`)
          .send(productPayload);

        expect(statusCode).toBe(201);
        expect(body.data).toEqual({
          __v: 0,
          _id: expect.any(String),
          createdAt: expect.any(String),
          description:
            'A book about learning node js in depth. In this book you can learn about design patterns, how node works inside and other cool stuff!',
          image:
            'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1541489138l/42643290._SY475_.jpg',
          price: 50.99,
          productId: expect.any(String),
          qty: 10,
          title: 'Node Js Book',
          updatedAt: expect.any(String),
          user: expect.any(String),
        });
      });
    });

    describe('given the user is staff and product payload is empty', () => {
      it('should return status code 400 and array of objects', async () => {
        //const user = await createUser(staffUserPayload);
        const jwt = signJWT(staffUserPayload);

        const { body, statusCode } = await supertest(app.getServer())
          .post('/api/products/')
          .set('Authorization', `Bearer ${jwt}`)
          .send({});

        expect(statusCode).toBe(400);
        expect(body).toEqual(productFieldsRequired);
      });
    });

    describe('given the user is admin and product payload is not empty', () => {
      it('should return status code 201 and created product', async () => {
        await createUser(adminUserPayload);
        const jwt = signJWT(adminUserPayload);

        const { body, statusCode } = await supertest(app.getServer())
          .post('/api/products/')
          .set('Authorization', `Bearer ${jwt}`)
          .send(productPayload);

        expect(statusCode).toBe(201);
        expect(body.data).toEqual({
          __v: 0,
          _id: expect.any(String),
          createdAt: expect.any(String),
          description:
            'A book about learning node js in depth. In this book you can learn about design patterns, how node works inside and other cool stuff!',
          image:
            'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1541489138l/42643290._SY475_.jpg',
          price: 50.99,
          productId: expect.any(String),
          qty: 10,
          title: 'Node Js Book',
          updatedAt: expect.any(String),
          user: expect.any(String),
        });
      });
    });
  });

  describe('product update route', () => {
    describe('given the user is not logged in', () => {
      it('should return status code 401', async () => {
        const { statusCode } = await supertest(app.getServer())
          .put('/api/products/product_random}')
          .send(updatedProductPayload);

        expect(statusCode).toBe(401);
      });
    });
    describe('given the user is not staff or admin', () => {
      it('should return status code 401', async () => {
        const { statusCode } = await supertest(app.getServer())
          .put('/api/products/product_random}')
          .send(updatedProductPayload);

        expect(statusCode).toBe(401);
      });
    });
    describe('given the product does not exist and user is staff', () => {
      it('should return status code 404', async () => {
        const productId = 'product-notexistent1';
        const jwt = signJWT(staffUserPayload);

        const { statusCode } = await supertest(app.getServer())
          .put(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${jwt}`)
          .send(updatedProductPayload);

        expect(statusCode).toBe(404);
      });
    });
    describe('given the product exists, user is staff update payload is not empty', () => {
      it('should return status code 200 and updated product', async () => {
        const jwt = signJWT(staffUserPayload);
        const res = await supertest(app.getServer())
          .post('/api/products/')
          .set('Authorization', `Bearer ${jwt}`)
          .send(productPayload);

        const { productId, _id, createdAt, updatedAt } = res.body.data;

        const { statusCode, body } = await supertest(app.getServer())
          .put(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${jwt}`)
          .send(updatedProductPayload);

        expect(statusCode).toBe(200);
        expect(body.data).toEqual({
          ...updatedProductPayload,
          productId,
          _id,
          user: expect.any(String),
          createdAt,
          updatedAt: expect.any(String),
          __v: 0,
        });
        expect(body.data.updatedAt).not.toEqual(updatedAt);
      });
    });
    describe('given the product exists, user is staff and update payload is empty', () => {
      it('should return status code 400 and array of objects', async () => {
        const jwt = signJWT(userPayload);
        const res = await supertest(app.getServer())
          .post('/api/products/')
          .set('Authorization', `Bearer ${jwt}`)
          .send(productPayload);

        const { productId } = res.body.data;

        const { statusCode, body } = await supertest(app.getServer())
          .put(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${jwt}`)
          .send();

        expect(statusCode).toBe(400);
        expect(body).toEqual(productFieldsRequired);
      });
    });
    describe('given the product exists, user is admin and update payload is not empty', () => {
      it('should return status code 200 and updated product', async () => {
        const jwt = signJWT(adminUserPayload);
        const res = await supertest(app.getServer())
          .post('/api/products/')
          .set('Authorization', `Bearer ${jwt}`)
          .send(productPayload);

        const { productId, _id, createdAt, updatedAt } = res.body.data;

        const { statusCode, body } = await supertest(app.getServer())
          .put(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${jwt}`)
          .send(updatedProductPayload);

        expect(statusCode).toBe(200);
        expect(body.data).toEqual({
          ...updatedProductPayload,
          productId,
          _id,
          user: expect.any(String),
          createdAt,
          updatedAt: expect.any(String),
          __v: 0,
        });
        expect(body.data.updatedAt).not.toEqual(updatedAt);
      });
    });
  });

  describe('product delete route', () => {
    describe('given the user is not logged in', () => {
      it('should return status code 401', async () => {
        const { statusCode } = await supertest(app.getServer()).delete(
          '/api/products/product_random'
        );

        expect(statusCode).toBe(401);
      });
    });
    describe('given the user is staff and product does not exist', () => {
      it('should return status code 404', async () => {
        const jwt = signJWT(staffUserPayload);

        const { statusCode } = await supertest(app.getServer())
          .delete('/api/products/product_random')
          .set('Authorization', `Bearer ${jwt}`);

        expect(statusCode).toBe(404);
      });
    });
    describe('given the user is staff and product exists', () => {
      it('should return status code 204', async () => {
        const jwt = signJWT(staffUserPayload);
        const res = await supertest(app.getServer())
          .post('/api/products/')
          .set('Authorization', `Bearer ${jwt}`)
          .send(productPayload);

        const { productId } = res.body.data;

        const { statusCode } = await supertest(app.getServer())
          .delete(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${jwt}`);

        expect(statusCode).toBe(204);
      });
    });
    describe('given the user is admin and product exists', () => {
      it('should return status code 204', async () => {
        const jwt = signJWT(adminUserPayload);
        const res = await supertest(app.getServer())
          .post('/api/products/')
          .set('Authorization', `Bearer ${jwt}`)
          .send(productPayload);

        const { productId } = res.body.data;

        const { statusCode } = await supertest(app.getServer())
          .delete(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${jwt}`);

        expect(statusCode).toBe(204);
      });
    });
  });
});
