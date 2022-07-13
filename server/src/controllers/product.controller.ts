import { Request, Response } from 'express';
import { isEmpty } from 'lodash';
import {
  CreateProductInput,
  DeleteProductInput,
  ReadProductInput,
  UpdateProductInput,
} from '../schemas/product.schema';
import ProductService from '../services/product.service';

class ProductController {
  public productService = new ProductService();

  /**
   *
   * @param req no params, no response body, CreateProductInput
   * @param Response
   */
  public createProductHandler = async (
    req: Request<{}, {}, CreateProductInput['body']>,
    res: Response
  ) => {
    const userId = res.locals.user._id;

    const body = req.body;

    const product = await this.productService.createProduct({
      ...body,
      user: userId,
    });

    return res
      .status(201)
      .json({ message: 'Successfully created Product', data: product });
  };

  public getProductHandler = async (
    req: Request<ReadProductInput['params']>,
    res: Response
  ) => {
    const productId = req.params.productId;

    const product = await this.productService.findProduct({ productId });

    if (!product)
      return res
        .status(404)
        .json({ message: 'Product with provided id Not Found' });

    return res
      .status(200)
      .json({ message: `Product # ${productId} was found`, data: product });
  };

  public getAllProductsHandler = async (_req: Request, res: Response) => {
    const products = await this.productService.getAllProducts({});

    if (isEmpty(products))
      return res
        .status(404)
        .json({ message: 'There are no Products in the database!' });

    return res
      .status(200)
      .json({ message: 'Displaying all products', data: products });
  };

  public updateProductHandler = async (
    req: Request<UpdateProductInput['params']>,
    res: Response
  ) => {
    const productId = req.params.productId;

    const product = await this.productService.findProduct({ productId });

    if (!product)
      return res
        .status(404)
        .json({ message: 'Product with provided id Not Found' });

    const payload = req.body;
    const updatedProduct = await this.productService.updateProductById(
      { productId },
      payload,
      { new: true }
    );

    return res.status(200).json({
      message: `Product # ${productId} was updated successfully!`,
      data: updatedProduct,
    });
  };

  public deleteProductHandler = async (
    req: Request<DeleteProductInput['params']>,
    res: Response
  ) => {
    const productId = req.params.productId;

    const product = await this.productService.findProduct({ productId });

    if (!product)
      return res
        .status(404)
        .json({ message: 'Product with provided id Not Found' });

    await this.productService.deleteProductById({ productId });

    return res.sendStatus(204);
  };
}

export default ProductController;
