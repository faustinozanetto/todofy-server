import 'reflect-metadata'

import connectRedis from 'connect-redis'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import session, { SessionOptions } from 'express-session'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { createConnection } from 'typeorm'
import { verify } from 'jsonwebtoken'

import { TestResolver, TodoResolver, UserResolver } from './resolvers/index'
import { Logger, LogLevel } from './logger/index'
import { databaseOptions } from './database/index'
import {
  __apiOrigin__,
  __cookie__,
  __origin__,
  __port__,
  __prod__,
  __redis__,
  __refreshSecret__,
  __secret__,
} from './utils/constants'
import { Todo, User } from './entities'
import { createAccessToken, createRefreshToken } from './auth/auth'
import { sendRefreshToken } from './auth/sendRefreshToken'
import { redis } from './redis'

require('dotenv').config({ silent: true });

export const logger = new Logger('Todofy | ');
const RedisStore = connectRedis(session); // connect node.req.session to redis backing store

const main = async () => {
  const options = await databaseOptions();
  const connection = await createConnection(options);
  await connection.runMigrations();

  logger.log(
    LogLevel.INFO,
    'Successfully connected to database: ' + connection.name
  );

  // Express app
  const app = express();
  app.use(cookieParser());
  app.set('trust proxy', 1);

  // Express cors middleware
  app.use(
    cors({
      origin: __origin__!,
      credentials: true,
    })
  );

  const sessionOption: SessionOptions = {
    store: new RedisStore({
      client: redis,
    }),
    name: 'qid',
    secret: __secret__!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/refresh_token',
    },
  };

  app.use(session(sessionOption));

  app.get('/', (req, res) => res.send(req.headers));
  app.post('/refresh_token', async (req, res) => {
    const token = req.cookies.qid;
    if (!token) {
      return res.send({
        ok: false,
        message: 'Could not find token',
        accessToken: '',
      });
    }

    let payload: any = null;
    try {
      payload = verify(token, __refreshSecret__!);
    } catch (err) {
      logger.log(
        LogLevel.ERROR,
        'An error occurred while trying to get payload'
      );
      return res.send({
        ok: false,
        message: 'An error occurred while trying to get payload',
        accessToken: '',
      });
    }

    // token is valid and
    // we can send back an access token
    const user = await User.findOne({ id: payload.userId });

    if (!user) {
      logger.log(LogLevel.ERROR, 'User not found');
      return res.send({
        ok: false,
        message: 'Could not find user',
        accessToken: '',
      });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      logger.log(
        LogLevel.ERROR,
        'User token version different from payload version!'
      );
      return res.send({
        ok: false,
        message: 'User token version different from payload version!',
        accessToken: '',
      });
    }
    sendRefreshToken(res, createRefreshToken(user));

    return res.send({
      ok: true,
      message: 'Successfully created access token!',
      accessToken: createAccessToken(user),
    });
  });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [TestResolver, UserResolver, TodoResolver],
      validate: false,
    }),
    introspection: true,
    playground: {
      settings: {
        'request.credentials': 'include',
      },
    },
    context: ({ req, res }) => ({ req, res, User, Todo }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(__port__ || 4000, () => {
    logger.log(
      LogLevel.INFO,
      'Successfully started Todofy Server on port ' + __port__
    );
  });
};

main().catch((error) => {
  logger.log(
    LogLevel.ERROR,
    'There has been an error while trying to initialize Todofy Server ' + error
  );
});
