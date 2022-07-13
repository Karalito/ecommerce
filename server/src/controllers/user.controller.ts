import { Request, Response } from 'express';
import { isEmpty } from 'lodash';
import {
  CreateUserInput,
  DeleteUserInput,
  ReadUserInput,
  UpdateUserInput,
} from '../schemas/user.schema';
import UserService from '../services/user.service';
import logger from '../utils/logger';

class UserController {
  public userService = new UserService();

  public createUserHandler = async (
    req: Request<{}, {}, CreateUserInput['body']>,
    res: Response
  ) => {
    try {
      const user = await this.userService.createUser(req.body);

      return res.status(201).json({
        message: 'User created Successfully!',
        data: user, // CHECK TO NOT RETURN PASSWORD
      });
    } catch (e: any) {
      logger.error(e);
      return res.status(409).send(e.message);
    }
  };

  public getUserHandler = async (
    req: Request<ReadUserInput['params']>,
    res: Response
  ) => {
    const userId = req.params.userId;

    const user = await this.userService.findUser({ _id: userId });

    if (!user)
      return res
        .status(404)
        .json({ message: 'User with provided id Not Found' });

    return res
      .status(200)
      .json({ message: `User # ${userId} was found`, data: user });
  };

  public getAllUsersHandler = async (_req: Request, res: Response) => {
    const users = await this.userService.getAllUsers({});

    if (isEmpty(users))
      return res
        .status(404)
        .json({ message: 'There are no Users in the database' });
    return res
      .status(200)
      .json({ message: 'Displaying all users', data: users });
  };

  public updateUserHandler = async (
    req: Request<UpdateUserInput['params']>,
    res: Response
  ) => {
    const userId = req.params.userId;

    const foundUser = await this.userService.findUser({ _id: userId });

    if (!foundUser)
      return res
        .status(404)
        .json({ message: 'User with provided id Not Found' });

    const requestUserId = res.locals.user._id;

    if (requestUserId !== userId) {
      const user = await this.userService.findUser({ _id: requestUserId });

      if (user && user.userType !== 'admin')
        return res.status(401).json({ message: 'Unauthorized' });
    }
    logger.info('request user id', requestUserId, 'user id', userId);
    const payload = req.body;
    const updatedUser = await this.userService.updateUserById(
      { _id: userId },
      payload,
      { new: true }
    );

    return res.status(200).json({
      message: `User # ${userId} was updated successfully`,
      data: updatedUser,
    });
  };

  public deleteUserHandler = async (
    req: Request<DeleteUserInput['params']>,
    res: Response
  ) => {
    const userId = req.params.userId;

    const user = await this.userService.findUser({ _id: userId });

    if (!user)
      return res
        .status(404)
        .json({ message: 'User with provided id Not Found' });

    await this.userService.deleteUserById({ _id: userId });

    return res.sendStatus(204);
  };
}

export default UserController;
