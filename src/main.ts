import { initApp } from "./app";
import { Env } from "./env";

const start = async () => {
    const app = await initApp();

    const port = Env.PORT;

    app.listen(port, () => {
        console.log(`trip-dude backend is running on port ${port} 🖼️`);
    });
};

start();