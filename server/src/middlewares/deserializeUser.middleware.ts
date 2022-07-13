import { Request, Response, NextFunction } from 'express';
import { get } from 'lodash';
import SessionService from '../services/session.service';
import { verifyJWT } from '../utils/jwt.utils';

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = get(req, 'headers.authorization', '').replace(
    /^Bearer\s/,
    ''
  );

  if (!accessToken) return next();

  // Verify access token
  const { decoded, expired } = verifyJWT(accessToken);

  if (decoded) {
    res.locals.user = decoded;
    return next();
  }

  const refreshToken = get(req, 'headers.x-refresh');

  if (expired && refreshToken) {
    const sessionService = new SessionService();

    const newAccessToken = await sessionService.reissueAccessToken({
      refreshToken,
    });

    if (newAccessToken) {
      res.setHeader('x-access-token', newAccessToken);

      const result = verifyJWT(newAccessToken);

      res.locals.user = result.decoded;
    }
    return next();
  }

  return next();
};

export default deserializeUser;
