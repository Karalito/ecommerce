import express, { Application } from 'express';
import config from 'config';
import { Routes } from './interfaces/routes.interface';
import connectDb from './utils/connect';
import logger from './utils/logger';
import deserializeUser from './middlewares/deserializeUser.middleware';

class App {
  public app: Application;
  public port: number;
  public env: string;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = config.get<string>('env');
    this.port = config.get<number>('port');

    this.initializeDbConnection();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
  }

  public getServer() {
    return this.app;
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`Server is running on http://localhost:${this.port}`);
    });
  }

  private initializeDbConnection(): void {
    if (this.env !== 'test') connectDb(this.env);
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(deserializeUser);
  }

  private initializeRoutes(routes: Routes[]): void {
    routes.forEach((route) => {
      this.app.use(`/api/${route.path}` || '/', route.router);
    });
  }
}

export default App;
