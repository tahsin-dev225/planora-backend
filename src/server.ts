import { Server } from "node:http";
import app from "./app";
// import { seedSuperAdmin } from "./app/utils/seed";
import { envVars } from "./config/env";

let server: Server;
const boostrap = async () => {
  try {
    // await seedSuperAdmin()
    server = app.listen(envVars.PORT, () => {
      console.log(`Server is running o http://localhost:${envVars.PORT}`);
    })
  } catch (error) {
    console.log('Feild to start server', error);
  }
}

// SIGTERM signal handler
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received. Shutting down server...");

  if (server) {
    server.close(() => {
      console.log("Server closed gracefully.");
      process.exit(1);
    });
  }

  process.exit(1);

})

// SIGINT signal handler

process.on("SIGINT", () => {
  console.log("SIGINT signal received. Shutting down server...");

  if (server) {
    server.close(() => {
      console.log("Server closed gracefully.");
      process.exit(1);
    });

  }

  process.exit(1);
});

// uncaughtException 
process.on('uncaughtException', (error) => {
  console.log("Uncaught Exception Detected... Shutting down server", error);

  if (server) {
    server.close(() => {
      process.exit(1);
    })
  }

  process.exit(1);
})

// unhandledRejection
process.on("unhandledRejection", (error) => {
  console.log("Unhandled Rejection Detected... Shutting down server", error);

  if (server) {
    server.close(() => {
      process.exit(1);
    })
  }

  process.exit(1);
})

boostrap()
