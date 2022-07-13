import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { Routes } from '../interfaces/routes.interface';
import { authorizeUser } from '../middlewares';
import requireUser from '../middlewares/requireUser.middleware';
import validateResource from '../middlewares/validateResource.middleware';
import {
  createUserSchema,
  deleteUserSchema,
  getUserSchema,
  updateUserSchema,
} from '../schemas/user.schema';

class UserRoutes implements Routes {
  public path: string = 'users';
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.userController.getAllUsersHandler);
    this.router.get(
      '/:userId',
      validateResource(getUserSchema),
      this.userController.getUserHandler
    );
    this.router.post(
      '/',
      validateResource(createUserSchema),
      this.userController.createUserHandler
    );
    this.router.put(
      '/:userId',
      [requireUser, validateResource(updateUserSchema)],
      this.userController.updateUserHandler
    );
    this.router.delete(
      '/:userId',
      [requireUser, authorizeUser('admin'), validateResource(deleteUserSchema)],
      this.userController.deleteUserHandler
    );
  }
}

export default UserRoutes;
