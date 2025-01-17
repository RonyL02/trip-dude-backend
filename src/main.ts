import { initApp, initSwagger } from './app';
import { Env } from './env';

const start = async () => {
  const app = await initApp();

  if (Env.NODE_ENV !== 'test') {
    initSwagger(app);
  }

  const port = Env.PORT;

  app.listen(port, () => {
    console.log(`trip-dude backend is running on port ${port} 🖼️`);
  });
};

start();