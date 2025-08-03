export default class {
  static defaults = {
    session: {
      cookie: "session_auth",
      livespan: 24 * 60 * 60, // 1 day
    },
    jwt: {
      cookie: "jwt_auth",
      livespan: 15 * 60, // 15 minutes
    },
  };
}
