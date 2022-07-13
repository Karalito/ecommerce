import { Router } from 'express';
import ProductController from '../controllers/product.controller';
import { Routes } from '../interfaces/routes.interface';
import { requireUser, validateResource, authorizeUser } from '../middlewares';
import {
  createProductSchema,
  deleteProductSchema,
  getProductSchema,
  updateProductSchema,
} from '../schemas/product.schema';
import { userRole } from '../models/user.model';

class ProductRoutes implements Routes {
  public path: string = 'products';
  public router = Router();
  public productController = new ProductController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.productController.getAllProductsHandler);
    this.router.get(
      '/:productId',
      validateResource(getProductSchema),
      this.productController.getProductHandler
    );
    this.router.post(
      '/',
      [
        requireUser,
        authorizeUser(userRole.staff),
        validateResource(createProductSchema),
      ],
      this.productController.createProductHandler
    );
    this.router.put(
      '/:productId',
      [
        requireUser,
        authorizeUser(userRole.staff),
        validateResource(updateProductSchema),
      ],
      this.productController.updateProductHandler
    );
    this.router.delete(
      '/:productId',
      [
        requireUser,
        authorizeUser(userRole.staff),
        validateResource(deleteProductSchema),
      ],
      this.productController.deleteProductHandler
    );
  }
}

export default ProductRoutes;
