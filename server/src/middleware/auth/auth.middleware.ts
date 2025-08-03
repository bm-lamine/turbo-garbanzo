import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import type { Session } from "#/repos/auth/session.repo";
import sessionRepo from "#/repos/auth/session.repo";
import type { User } from "#/repos/auth/user.repo";
import authUtils from "#/utils/auth/auth.utils";
import jwtUtils from "#/utils/auth/jwt.utils";
import { StatusCodes } from "#/utils/status-codes";

export default createMiddleware<{
  Variables: { user: User; session: Session };
}>(async (ctx, next) => {
  const token =
    getCookie(ctx, authUtils.defaults.jwt.cookie) ||
    ctx.req.header("Authorization")?.split(" ")[1];
  if (!token) {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, {
      message: "Missing Token",
    });
  }

  const sessionId = await jwtUtils.verify(token);
  if (!sessionId) {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, {
      message: "Invalid Token",
    });
  }

  const res = await sessionRepo.validate(sessionId);
  if (!res) {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, {
      message: "Invalid Session",
    });
  }

  ctx.set("session", res.session);
  ctx.set("user", res.user);
  return next();
});
