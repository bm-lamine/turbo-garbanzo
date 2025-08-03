import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";

const app = new Hono();

// ---------------------------------- middlewares -----------------------------------
app.use(csrf());
app.use(cors());

// ---------------------------------- routers -----------------------------------
app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default { port: 4321, fetch: app.fetch };
