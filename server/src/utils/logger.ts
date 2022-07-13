import pino from 'pino';
import dayjs from 'dayjs';

const transport = pino.transport({
  target: 'pino-pretty',
  options: { colorize: true },
});
/**
 * Initializing logger
 * pid: process id.
 */
const logger = pino(
  {
    base: {
      pid: false,
    },
    timestamp: () => `,"time":"${dayjs().format()}"`,
  },
  transport
);

export default logger;
