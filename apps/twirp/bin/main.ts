import { PrismaClient } from "@prisma/client";
import express from "express";
import { env } from "../env";
import { createServer as createUsersService } from "../services/users";

function getPrismaClient() {
  const { DATABASE_URL, NODE_ENV } = env;

  const databaseUrl = new URL(DATABASE_URL);

  console.log(`🔌 setting up prisma client to ${databaseUrl.host}`);
  // NOTE: during development if you change anything in this function, remember
  // that this only runs once per server restart and won't automatically be
  // re-run per request like everything else is. So if you need to change
  // something in this file, you'll need to manually restart the server.
  const client = new PrismaClient({
    log: NODE_ENV === "development" ? ["query", "info", "warn", "error"] : [],
    datasources: {
      db: {
        url: databaseUrl.toString(),
      },
    },
  });

  return client;
}

const usersService = createUsersService({ prisma: getPrismaClient() });

const app = express();

console.log("twirp server is gonna be routed to: ", usersService.matchingPath());

app.post(usersService.matchingPath(), usersService.httpHandler());

app.listen(env.PORT, () => {
  console.log(`server is running at ${env.PORT}`);
});