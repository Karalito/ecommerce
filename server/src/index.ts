import App from './app';
import { ProductRoutes, SessionRoutes, UserRoutes } from './routes';

const app = new App([
  new SessionRoutes(),
  new UserRoutes(),
  new ProductRoutes(),
]);

app.listen();
