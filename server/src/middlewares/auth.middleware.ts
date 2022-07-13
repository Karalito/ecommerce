import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model';

const authorizeUser = (role: string) =>
  asyncHandler(async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const user = res.locals.user;
      const foundUser = await User.findOne({ _id: user._id });

      if (!foundUser) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      if (foundUser.userType === 'admin') {
        return next();
      }

      if (foundUser.userType !== role) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      return next();
    } catch (err) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
  });

export default authorizeUser;
