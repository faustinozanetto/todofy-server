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
import {
  __cookie__,
  __origin__,
  __port__,
  __prod__,
  __refreshSecret__,
  __secret__,
} from './utils/constants';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from './entities';
import { createAccessToken, createRefreshToken } from './auth/auth';
import { sendRefreshToken } from './auth/sendRefreshToken';

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

  app.set('trust proxy', 1);

  app.use(express.json());

  app.use(cookieParser());

  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  // Express cors middleware
  app.use(
    cors({
      origin: __origin__,
      credentials: true,
    })
  );

  app.get('/', (_req, res) => res.send('hello'));
  app.post('/refresh_token', async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
      return res.send({ ok: false, accessToken: '' });
    }

    let payload: any = null;
    try {
      payload = jwt.verify(token, __refreshSecret__!);
    } catch (err) {
      console.log(err);
      return res.send({ ok: false, accessToken: '' });
    }

    // token is valid and
    // we can send back an access token
    const user = await User.findOne({ id: payload.userId });

    if (!user) {
      logger.log(LogLevel.ERROR, 'User not found');
      return res.send({ ok: false, accessToken: '' });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      logger.log(
        LogLevel.ERROR,
        'User token version different from payload version!'
      );
      return res.send({ ok: false, accessToken: '' });
    }

    sendRefreshToken(res, createRefreshToken(user));

    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [TestResolver, UserResolver, TodoResolver],
      validate: false,
    }),
    introspection: true,
    playground: true,
    context: ({ req, res }) => ({ req, res }),
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
