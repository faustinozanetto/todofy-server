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
  __redis__,
  __refreshSecret__,
  __secret__,
} from './utils/constants';
import dotenv from 'dotenv';
import passport from 'passport';
import { buildContext } from 'graphql-passport';
import { User } from './entities';
import { createRefreshToken, createAccessToken } from './auth/auth';
import { sendRefreshToken } from './auth/sendRefreshToken';
import { Secret, verify } from 'jsonwebtoken';

export const logger = new Logger('Todofy | ');

const main = async () => {
  dotenv.config();
  const options = await databaseOptions();
  const connection = await createConnection(options);

  console.log(process.env);

  logger.log(
    LogLevel.INFO,
    'Successfully connected to database: ' + connection.name
  );

  // Express app
  const app = express();

  app.set('trust proxy', 1);

  // Express cors middleware
  app.use(
    cors({
      origin: __origin__,
      credentials: true,
    })
  );

  /*
  app.use(
    session({
      name: __cookie__,
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
  */

  app.use(express.json());

  app.use(cookieParser());

  /*
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new GraphQLLocalStrategy(
      async (username: any, password: any, done: any) => {
        const user = await User.findOne({ where: { username: username } });
        if (!user) {
          return done('No user has been found with the given Username!', false);
        }
        try {
          if (await argon2.verify(user.password, password)) {
            return done(null, user);
          } else {
            return done('The password is not correct!', false);
          }
        } catch (err) {
          console.log(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    //@ts-ignore
    done(null, user.username);
  });

  passport.deserializeUser(async (username: string, done) => {
    try {
      const user = await User.findOne({ where: { username: username } });
      if (user) {
        return done(null, user);
      }
      return done('No user has been found with the given Username!', false);
    } catch (err) {
      done(err, null);
    }
  });
  */

  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  app.post('/login', passport.authenticate('local'), (_req, res) => {
    res.send('success');
    res.send(res.getHeaders().authorization);
  });

  app.get('/user', (req, res) => {
    res.send(req.user);
  });

  app.get('/logout', (req, res) => {
    req.logout();
    res.send('Logged out');
  });

  app.get('/', (_req, res) => res.send('hello'));
  app.post('/refresh_token', async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
      return res.send({
        ok: false,
        message: 'Could not find token',
        accessToken: '',
      });
    }

    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET as Secret);
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
    context: ({ req, res }) => buildContext({ req, res, User }),
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
