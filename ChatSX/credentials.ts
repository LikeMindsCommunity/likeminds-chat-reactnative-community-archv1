import {myClient} from '..';

export class Credentials {
  private static _username: string = '';
  private static _userUniqueId: string = '';

  static setCredentials(username: string, userUniqueId: string): void {
    Credentials._username = username;
    Credentials._userUniqueId = userUniqueId;
    myClient.setUserSchema(userUniqueId, username);
  }

  static get username(): string {
    return Credentials._username;
  }

  static get userUniqueId(): string {
    return Credentials._userUniqueId;
  }
}
