import * as jwt from "hono/jwt";

import config from "#/config";
import authUtils from "./auth.utils";

export default class {
  static async sign(sessionId: string) {
    return await jwt.sign(
      {
        sessionId,
        exp: Math.floor(Date.now() / 1000) + authUtils.defaults.jwt.lifespan,
      },
      config.env.JWT_SECRET,
    );
  }

  static async verify(token: string) {
    try {
      const payload = await jwt.verify(token, config.env.JWT_SECRET);
      return String(payload.sessionId);
    } catch (err) {
      console.error(`Verifying Token Failed: ${err}`);
      return null;
    }
  }
}
