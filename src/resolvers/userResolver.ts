import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { UsersResponse, UserResponse } from '../responses/user';
import { getConnection, getRepository } from 'typeorm';
import { TodofyContext } from '../types';
import { User } from '../entities';
import { validateUserRegistration } from '../utils';
import { UserCredentialsInput } from '../inputs';
import argon2 from 'argon2';
import { logger } from '../index';
import { LogLevel } from '../logger';
import { verify } from 'jsonwebtoken';
import { __cookie__, __secret__ } from '../utils/constants';
import { TodosResponse } from '../responses/todo/Todos';
import { sendRefreshToken } from '../auth/sendRefreshToken';
import { createRefreshToken, createAccessToken } from '../auth/auth';
import { isAuth } from '../middleawares/auth';

@Resolver()
export class UserResolver {
  @Query(() => UsersResponse)
  async users(): Promise<UsersResponse> {
    return { users: await User.find() };
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  isAuthTest(@Ctx() { payload }: TodofyContext) {
    console.log(payload);
    return `your user id is: ${payload!.userId}`;
  }

  /**
   *
   * @param input User register input
   * @param ctx Todofy Context
   * @returns If input is valid, return registered User
   */
  @Mutation(() => UserResponse)
  async register(
    @Arg('input') input: UserCredentialsInput
  ): Promise<UserResponse> {
    const errors = validateUserRegistration(input);
    if (errors) {
      return { errors };
    }

    // Hashing Password
    const hashedPassword = await argon2.hash(input.password);
    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: input.username,
          email: input.email,
          password: hashedPassword,
        })
        .returning('*')
        .execute();
      user = result.raw[0];
      logger.log(
        LogLevel.INFO,
        'Successfully inserted user: ' + JSON.stringify(user)
      );
    } catch (error) {
      if (error.code === '23505') {
        return {
          errors: [
            {
              field: 'username',
              message: 'Username already taken',
            },
          ],
        };
      }
    }

    return { user };
  }

  /**
   *
   * @param username The username of the user
   * @param password The password of the user
   * @param ctx Todofy Context
   * @returns If credentials are correct, return the User
   */
  @Mutation(() => UserResponse)
  async login(
    @Arg('username', () => String) username: string,
    @Arg('password', () => String) password: string,
    @Ctx() { res }: TodofyContext
  ): Promise<UserResponse> {
    /*
    const user = await User.findOne({ where: { username } });

    // Username does not exist.
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: 'That username does not exists!',
          },
        ],
      };
    }
    /*
    // De-hashing password
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return {
        errors: [{ field: 'password', message: 'Password does not match!' }],
      };
    }

    const token = jwt.sign({ email: user.email, id: user.id }, __secret__!, {
      expiresIn: '1h',
    });

    return {
      user,
      accessToken: token,
    };
    */

    const user = await User.findOne({ where: { username } });

    if (!user) {
      throw new Error('could not find user');
    }

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      throw new Error('bad password');
    }

    // login successful

    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
      user,
    };

    // GRAPHQL AUTH
    /*
    try {
      const { user } = await ctx.authenticate('graphql-local', {
        username,
        password,
      });
      //@ts-ignore
      await ctx.login(user);
      return { user };
    } catch (error) {
      return {
        errors: [{ field: 'username', message: error }],
      };
    }
    */
  }

  /**
   *
   * @param ctx Todofy Context
   * @returns True or False wether logout was successful or not.
   */
  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: TodofyContext): Promise<Boolean> {
    /*
    try {
      req.logOut();
      return true;
    } catch (error) {
      logger.log(
        LogLevel.ERROR,
        'An error occurred while trying to log out user!'
      );
      return false;
    }
    */
    sendRefreshToken(res, '');
    return true;
  }

  /**
   * @param ctx Todofy Context
   * @returns Current user logged in the page.
   */
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: TodofyContext) {
    /*  
    const user = ctx.getUser();
    console.log('Me query', user);

    return user;
    */
    const authorization = ctx.req.headers['authorization'];

    if (!authorization) {
      return null;
    }

    try {
      const token = authorization.split(' ')[1];
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
      console.log('Payload', payload);
      return await User.findOne({ where: { id: payload.userId } });
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokenForUser(@Arg('id', () => Int) id: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id }, 'tokenVersion', 1);

    return true;
  }

  /**
   *
   * @param param0
   */
  @Query(() => TodosResponse)
  async userTodos(@Arg('id', () => Int) id: number): Promise<TodosResponse> {
    const user = await getRepository(User).findOne(id, {
      relations: ['todos'],
    });

    if (!user) {
      return {
        errors: [
          { field: 'user', message: 'Could not found user with that ID!' },
        ],
      };
    }

    return {
      todos: user.todos,
    };
  }
}
