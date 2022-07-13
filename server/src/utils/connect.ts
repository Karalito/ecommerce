import mongoose from 'mongoose';
import config from 'config';
import logger from './logger';

async function connectDb(envType: string) {
  const dbUri = config.get<string>('dbUri');
  try {
    if (envType !== 'production') mongoose.set('debug', true);
    await mongoose.connect(dbUri);
    logger.info('Connection to database established successfully!');
  } catch (e) {
    logger.error('Could not establish connection to the database!');
    process.exit(1);
  }
}

export default connectDb;
