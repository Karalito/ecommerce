import config from 'config';
import { Request, Response } from 'express';
import SessionService from '../services/session.service';
import UserService from '../services/user.service';
import { signJWT } from '../utils/jwt.utils';

class SessionController {
  public sessionService = new SessionService();
  public userService = new UserService();

  public createUserSessionHandler = async (req: Request, res: Response) => {
    try {
      // Validate User
      const user = await this.userService.validatePassword(req.body);

      if (!user) return res.status(401).send('Invalid Email or Password');

      // Create Session
      const session = await this.sessionService.createSession(
        user._id,
        req.get('user-agent') || ''
      );

      // Create Access Token
      const accessToken = signJWT(
        { ...user, session: session._id },
        { expiresIn: config.get('accessTokenExpiresIn') } // 15 Min
      );

      // Create Refresh Token
      const refreshToken = signJWT(
        { ...user, session: session._id },
        { expiresIn: config.get('refreshTokenExpiresIn') }
      );

      // Return Tokens
      return res.status(201).json({ accessToken, refreshToken });
    } catch (err) {
      throw err;
    }
  };

  public getUserSessionsHandler = async (_req: Request, res: Response) => {
    const userId = res.locals.user._id;

    const sessions = await this.sessionService.getUserSessions({
      user: userId,
      valid: true,
    });

    return res.status(200).json(sessions);
  };

  public deleteSessionHandler = async (_req: Request, res: Response) => {
    const sessionId = res.locals.user.session;
    await this.sessionService.updateSession(
      { _id: sessionId },
      { valid: false }
    );
    return res.status(200).json({
      accessToken: null,
      refreshToken: null,
    });
  };
}
export default SessionController;
