import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Product, {
  ProductDocument,
  ProductInput,
} from '../models/product.model';

class ProductService {
  public products = Product;

  public createProduct = async (input: ProductInput) => {
    return await this.products.create(input);
  };

  public findProduct = async (
    query: FilterQuery<ProductDocument>,
    options: QueryOptions = { lean: true }
  ) => {
    return await this.products.findOne(query, {}, options);
  };

  public getAllProducts = async (
    query: FilterQuery<ProductDocument>,
    options: QueryOptions = { lean: true }
  ) => {
    return await this.products.find(query, {}, options);
  };

  public updateProductById = async (
    query: FilterQuery<ProductDocument>,
    update: UpdateQuery<ProductDocument>,
    options: QueryOptions
  ) => {
    return await this.products.findOneAndUpdate(query, update, options);
  };
  public deleteProductById = async (query: FilterQuery<ProductDocument>) => {
    return await this.products.deleteOne(query);
  };
}

export default ProductService;
