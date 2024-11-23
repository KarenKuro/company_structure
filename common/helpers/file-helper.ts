export class FileHelpers {
  static generatePath(path: string) {
    const host = process.env.MEDIA_HOST;
    return path ? `${host}/${path}` : path;
  }

  static removeHostFromPath(path: string): string {
    const host = process.env.MEDIA_HOST || 'http://localhost:3007';
    const regex = new RegExp(`^${host}` + '/');
    return path.replace(regex, ''); // Убираем host из начала строки
  }
}
