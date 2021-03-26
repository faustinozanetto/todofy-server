import 'reflect-metadata';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { TestResolver, TodoResolver, UserResolver } from './resolvers/index';
import { Logger, LogLevel } from './logger/index';
import { databaseOptions } from './database/index';
import { createConnection } from 'typeorm';
import session from 'express-session';
//@ts-ignore
import connectSqlite3 from 'connect-sqlite3';
import {
  __cookie__,
  __origin__,
  __port__,
  __prod__,
  __redis__,
  __refreshSecret__,
  __secret__,
} from './utils/constants';
//import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
/*
import { User } from './entities';
import { createAccessToken, createRefreshToken } from './auth/auth';
import { sendRefreshToken } from './auth/sendRefreshToken';
*/
import connectRedis from 'connect-redis';
import Redis from 'ioredis';

dotenv.config();

export const logger = new Logger('Todofy | ');

const main = async () => {
  const options = await databaseOptions();
  const connection = await createConnection(options);

  logger.log(
    LogLevel.INFO,
    'Successfully connected to database: ' + connection.name
  );

  // Express app
  const app = express();
  const RedisStore = connectRedis(session);
  let redis: Redis.Redis;
  redis = new Redis(__redis__);

  // if (!__prod__) {
  //   redis = new Redis({
  //     host: 'redis-16289.c239.us-east-1-2.ec2.cloud.redislabs.com:16289',
  //     password: '9AQGGdtJCyZyhqav4sI6EDuASG1ybPgq',
  //     sentinelPassword: '9AQGGdtJCyZyhqav4sI6EDuASG1ybPgq',
  //     name: 'todofy-session',
  //   });
  // } else {
  //   redis = new Redis({
  //     host: process.env.REDIS!,
  //     port: 16289,
  //     password: '9AQGGdtJCyZyhqav4sI6EDuASG1ybPgq',
  //   });
  // }

  app.set('trust proxy', 1);

  // Express cors middleware
  app.use(
    cors({
      origin: __origin__,
      credentials: true,
    })
  );

  app.use(
    session({
      name: __cookie__,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__, // cookie only works in https
        domain: __prod__ ? '.codeponder.com' : undefined,
      },
      saveUninitialized: false,
      secret: __secret__!,
      resave: false,
    })
  );

  app.use(express.json());

  app.use(cookieParser());

  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  /*
  app.get('/', (_req, res) => res.send('hello'));
  app.post('/refresh_token', async (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    const token = req.cookies.jid;
    if (!token) {
      return res.send({
        succeed: false,
        message: 'Could not find token',
        accessToken: '',
      });
    }

    let payload: any = null;
    try {
      payload = jwt.verify(token, __refreshSecret__!);
    } catch (err) {
      logger.log(
        LogLevel.ERROR,
        'An error occurred while trying to get payload'
      );
      return res.send({
        succeed: false,
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
        succeed: false,
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
        succeed: false,
        message: 'User token version different from payload version!',
        accessToken: '',
      });
    }

    sendRefreshToken(res, createRefreshToken(user));

    return res.send({
      succeed: false,
      message: 'Successfully created access token!',
      accessToken: createAccessToken(user),
    });
  });

  */
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
    context: ({ req, res }) => ({ req, res, redis }),
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
