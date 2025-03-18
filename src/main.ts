import { initApp, initSwagger } from './app';
import { Env } from './env';
import https from 'https';
import fs from 'fs';
const start = async () => {
  const app = await initApp();

  if (Env.NODE_ENV !== 'test') {
    initSwagger(app);
  }

  const port = Env.PORT;
  if (Env.NODE_ENV !== 'production') {
    app.listen(port, () => {
      console.log(`trip-dude backend is running on port ${port} 🖼️`);
    });
  } else {
    const httpsConfig = {
      key: fs.readFileSync('../client-key.pem'),
      cert: fs.readFileSync('../client-cert.pem')
    };
    https.createServer(httpsConfig, app).listen(port);
  }
};

start();
