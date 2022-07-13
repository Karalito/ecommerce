import { Request, Response, NextFunction } from 'express';

const requireUser = (_req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;

  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  return next();
};

export default requireUser;
