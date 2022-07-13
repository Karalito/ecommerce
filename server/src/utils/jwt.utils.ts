import jwt from 'jsonwebtoken';
import config from 'config';

const publicKey = config.get<string>('publicKey');
const privateKey = config.get<string>('privateKey');

/**
 * @method signJWT
 * @param object - User
 * @param options - Sign Options of JWT
 * @returns signed token
 * @description Method to sign JWT token
 */
export const signJWT = (
  object: Object,
  options?: jwt.SignOptions | undefined
) => {
  return jwt.sign(object, privateKey, {
    // Check if options are defined
    ...(options && options),
    algorithm: 'RS256',
  });
};

/**
 * @method verifyJWT
 * @param token string
 * @returns Object {valid: true | false, expired: false | message, decoded: Object | null}
 * @description Method to verify JWT token
 */
export const verifyJWT = (token: string) => {
  try {
    const decoded = jwt.verify(token, publicKey);
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: any) {
    return {
      valid: false,
      expired: e.message === 'jwt expired',
      decoded: null,
    };
  }
};
