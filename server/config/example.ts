export default {
  port: 8000,
  env: 'development',
  host: 'localhost',
  dbUri: 'URL_OF_MONGODB',
  saltWorkFactor: 'NUMBER', // How many rounds the password should be salted
  accessTokenExpiresIn: 'FORMAT example: 10M, 20M etc..',
  refreshTokenExpiresIn: 'FORMAT example: 1y',
  // Keys can't have spaces
  publicKey: `-----BEGIN PUBLIC KEY-----
  GENERATE THE KEY
  -----END PUBLIC KEY-----`,
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
GENERATE THE KEY
  -----END RSA PRIVATE KEY-----`,
};
