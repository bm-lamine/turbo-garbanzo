export default class {
  static async hash(password: string) {
    return await Bun.password.hash(password);
  }

  static async verify(password: string, hash: string) {
    return await Bun.password.verify(password, hash);
  }
}
