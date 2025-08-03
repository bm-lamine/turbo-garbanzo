import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";

import config from "#/config";
import authDto from "#/dtos/auth/auth.dto";
import authMiddleware from "#/middleware/auth/auth.middleware";
import sessionRepo from "#/repos/auth/session.repo";
import userRepo from "#/repos/auth/user.repo";
import authUtils from "#/utils/auth/auth.utils";
import hashUtils from "#/utils/auth/hash.utils";
import jwtUtils from "#/utils/auth/jwt.utils";
import errorResponse from "#/utils/error-response";
import { StatusCodes } from "#/utils/status-codes";

const app = new Hono();

app.get("/", (ctx) => ctx.text("auth router"));

app.post("/register", zValidator("json", authDto.register), async (ctx) => {
  const data = ctx.req.valid("json");
  const found = await userRepo.findByEmail(data.email);

  if (found) {
    return ctx.json(
      {
        error: errorResponse<typeof authDto.register>(
          ["email"],
          "email already used",
        ),
      },
      StatusCodes.BAD_REQUEST,
    );
  }

  const hash = await hashUtils.hash(data.password);
  const user = await userRepo.create({ email: data.email, password: hash });

  if (!user) {
    return ctx.json(
      {
        error: errorResponse<typeof authDto.register>(
          undefined,
          "something went wrong",
        ),
      },
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return ctx.json({ user });
});

app.post("/login", zValidator("json", authDto.login), async (ctx) => {
  const data = ctx.req.valid("json");
  const user = await userRepo.findByEmail(data.email);

  if (!user) {
    return ctx.json(
      {
        error: errorResponse<typeof authDto.register>(
          ["email"],
          "account not found",
        ),
      },
      StatusCodes.BAD_REQUEST,
    );
  }

  const verification = hashUtils.verify(data.password, user.password);
  if (!verification) {
    return ctx.json(
      {
        error: errorResponse<typeof authDto.register>(
          ["email"],
          "invalid credentials",
        ),
      },
      StatusCodes.BAD_REQUEST,
    );
  }

  const session = await sessionRepo.create(user.id);

  if (!session) {
    return ctx.json(
      {
        error: errorResponse<typeof authDto.register>(
          undefined,
          "server error",
        ),
      },
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  const token = await jwtUtils.sign(session.id);

  setCookie(ctx, authUtils.defaults.jwt.cookie, token, {
    secure: true,
    httpOnly: config.env.NODE_ENV === "production",
    path: "/",
    maxAge: authUtils.defaults.session.lifespan,
    sameSite: "Strict",
  });

  return ctx.json({ user, token });
});

app.post("/logout", authMiddleware, async (ctx) => {
  const { id } = ctx.get("session");
  await sessionRepo.invalidate(id);
  deleteCookie(ctx, authUtils.defaults.jwt.cookie);
  return ctx.status(StatusCodes.OK);
});

export { app as authRouter };
