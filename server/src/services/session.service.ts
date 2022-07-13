import { FilterQuery, UpdateQuery } from 'mongoose';
import Session, { SessionDocument } from '../models/session.model';
import { signJWT, verifyJWT } from '../utils/jwt.utils';
import { get } from 'lodash';
import UserService from './user.service';
import config from 'config';

class SessionService {
  public sessions = Session;
  public userService = new UserService();

  public createSession = async (userId: string, userAgent: string) => {
    const session = await this.sessions.create({
      user: userId,
      userAgent,
    });

    return session;
  };

  public getUserSessions = async (query: FilterQuery<SessionDocument>) => {
    return this.sessions.find(query).lean(); // going to return plain object
  };

  public updateSession = async (
    query: FilterQuery<SessionDocument>,
    update: UpdateQuery<SessionDocument>
  ) => {
    return this.sessions.updateOne(query, update);
  };

  public reissueAccessToken = async ({
    refreshToken,
  }: {
    refreshToken: string;
  }) => {
    const { decoded } = verifyJWT(refreshToken);

    // Decoded doesn't exist or doesn't have id
    if (!decoded || !get(decoded, 'session')) return false;

    const session = await this.sessions.findById(get(decoded, 'session'));

    // Session doesn't exist or is invalid
    if (!session || !session.valid) return false;

    const user = await this.userService.findUser({ _id: session.user });

    if (!user) return false;

    // Create Access Token
    const accessToken = signJWT(
      { ...user, session: session._id },
      { expiresIn: config.get('accessTokenExpiresIn') } // 15 Min
    );

    return accessToken;
  };
}

export default SessionService;
