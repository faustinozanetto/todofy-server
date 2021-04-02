import { LogLevel } from './logLevel'

export class Logger {
  private prefix: string;

  // Initializing the Logger
  constructor(prefix: string) {
    this.prefix = prefix;
  }

  /**
   * Returns the prefix of the Logger.
   */
  public getPrefix(): string {
    return this.prefix;
  }

  /**
   * Returns the formatted LogLevel
   */
  public getLevel(logLevel: LogLevel): string {
    return logLevel + ' | ';
  }

  /**
   * Main function of the Logger, returning a message to the console depending on the log type.
   * @param logLevel LogLevel enum.
   * @param message Message to print to the console.
   */
  public log(logLevel: LogLevel, message: any): void {
    try {
      switch (logLevel) {
        case LogLevel.INFO:
          console.log(this.getPrefix() + this.getLevel(logLevel), message);
          break;

        case LogLevel.DEBUG:
          console.debug(this.getPrefix() + this.getLevel(logLevel), message);
          break;

        case LogLevel.WARNING:
          console.warn(this.getPrefix() + this.getLevel(logLevel), message);
          break;

        case LogLevel.ERROR:
          console.error(this.getPrefix() + this.getLevel(logLevel), message);
          break;

        default:
          console.log(this.getPrefix() + this.getLevel(logLevel), message);
          break;
      }
    } catch (error) {
      console.error(
        this.getPrefix() +
          'There has been an error while trying to log a message!'
      );
    }
  }
}
