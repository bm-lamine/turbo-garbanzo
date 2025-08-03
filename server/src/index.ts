import { Hono } from "hono";
import { cors } from "hono/cors";
import * as dev from "hono/dev";

import { authRouter } from "./routers/auth/auth.router";

const app = new Hono();

// ---------------------------------- middlewares -----------------------------------

// app.use(csrf());
app.use(cors());

// ---------------------------------- routers ---------------------------------------

app.route("/v1/auth", authRouter);
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// ---------------------------------- dev -------------------------------------------

dev.showRoutes(app);

export default { port: 3000, fetch: app.fetch };
