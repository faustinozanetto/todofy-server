import { ConnectionOptions } from 'typeorm';
import { Todo, User } from '../entities/index';
import { __prod__ } from '../utils/constants';

/**
 *
 * @returns TypeORM connection settings
 */
export const databaseOptions = async () => {
  let connOptions: ConnectionOptions;
  connOptions = {
    type: 'postgres',
    host: 'localhost',
    username: 'faust',
    password: '4532164mine',
    logging: true,
    synchronize: true,
    database: 'todofy',
    entities: [Todo, User],
  };

  return connOptions;
};
