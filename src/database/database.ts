import { MockTodos1617038920630 } from '../migrations/1617038920630MockTodos';
import { ConnectionOptions } from 'typeorm';
import { Todo, User } from '../entities/index';
import { __dbUrl__, __prod__ } from '../utils/constants';

/**
 *
 * @returns TypeORM connection settings
 */
export const databaseOptions = async () => {
  let connOptions: ConnectionOptions;
  if (!__prod__) {
    connOptions = {
      type: 'postgres',
      host: 'localhost',
      username: 'faust',
      password: '4532164mine',
      logging: true,
      synchronize: true,
      database: 'todofy',
      entities: [Todo, User],
      migrations: [MockTodos1617038920630],
    };
  } else {
    connOptions = {
      type: 'postgres',
      url: __dbUrl__,
      synchronize: true,
      logging: true,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
      entities: [Todo, User],
    };
  }

  return connOptions;
};
