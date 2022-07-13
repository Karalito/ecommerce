import { Router } from 'express';
import SessionController from '../controllers/session.controller';
import { Routes } from '../interfaces/routes.interface';
import requireUser from '../middlewares/requireUser.middleware';
import validateResource from '../middlewares/validateResource.middleware';
import { createSessionSchema } from '../schemas/session.schema';

class SessionRoutes implements Routes {
  public path: string = 'sessions';
  public router = Router();
  public sessionController = new SessionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      '/',
      requireUser,
      this.sessionController.getUserSessionsHandler
    );
    this.router.post(
      '/',
      validateResource(createSessionSchema),
      this.sessionController.createUserSessionHandler
    );
    this.router.delete(
      '/',
      requireUser,
      this.sessionController.deleteSessionHandler
    );
  }
}

export default SessionRoutes;
