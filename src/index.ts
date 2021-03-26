import 'reflect-metadata';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import passportMiddleware from './middlewares/passportJS';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { TestResolver, TodoResolver, UserResolver } from './resolvers/index';
import { Logger, LogLevel } from './logger/index';
import { databaseOptions } from './database/index';
import { createConnection } from 'typeorm';
import { __cookie__, __port__, __prod__, __secret__ } from './utils/constants';

export const logger = new Logger('Todofy | ');

const main = async () => {
  const options = await databaseOptions();
  const connection = await createConnection(options);

  logger.log(
    LogLevel.INFO,
    'Successfully connected to database: ' + connection.name
  );

  const app = express();

  app.use(express.json());

  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  // Express cors middleware
  app.use(
    cors({
      origin: __prod__ ? '' : 'http://localhost:3000',
      credentials: true,
    })
  );

  // Express session middleware
  app.use(
    session({
      name: __cookie__,
      secret: __secret__!,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      resave: false,
    })
  );

  // PassportJS middleware
  app.use(passport.initialize());

  passport.use(passportMiddleware);

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

  app.listen(__port__, () => {
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
