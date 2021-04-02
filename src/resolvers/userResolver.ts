import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import { getConnection, getRepository } from 'typeorm'
import { verify } from 'jsonwebtoken'

import { UserResponse, UsersResponse } from '../responses/user'
import { TodofyContext } from '../types'
import { Todo, User } from '../entities'
import { validateUserRegistration } from '../utils'
import { UserCredentialsInput } from '../inputs'
import { logger } from '../index'
import { LogLevel } from '../logger'
import { __cookie__, __secret__ } from '../utils/constants'
import { TodosResponse } from '../responses/todo/Todos'
import { sendRefreshToken } from '../auth/sendRefreshToken'
import { createAccessToken, createRefreshToken } from '../auth/auth'
import { isAuth } from '../middleawares/auth'

import argon2 from 'argon2';
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
    const user = await User.findOne({ where: { username } });

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

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [{ field: 'password', message: 'Password does not match!' }],
      };
    }

    // login successful
    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
      user,
    };
  }

  /**
   *
   * @param ctx Todofy Context
   * @returns True or False wether logout was successful or not.
   */
  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: TodofyContext): Promise<Boolean> {
    sendRefreshToken(res, '');
    return true;
  }

  /**
   * @param ctx Todofy Context
   * @returns Current user logged in the page.
   */
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: TodofyContext) {
    const authorization = ctx.req.headers['authorization'];

    if (!authorization) {
      return null;
    }

    try {
      const token = authorization.split(' ')[1];
      const payload: any = verify(token, __secret__!);
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
  @UseMiddleware(isAuth)
  async userTodos(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { payload }: TodofyContext
  ): Promise<TodosResponse> {
    const realLimit = Math.min(50, limit);
    const reaLimitPlusOne = realLimit + 1;

    let replacements: any[] = [];
    replacements.push(reaLimitPlusOne);
    replacements.push(payload?.userId);

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    // Creating the query
    const query = getRepository(Todo)
      .createQueryBuilder('todo')
      .select()
      .where('todo.creatorId = :creatorId', { creatorId: replacements[1] });

    // If cursor is provided, sort by date
    if (replacements[2]) {
      query.where('todo.createdAt < :createdAt', {
        createdAt: replacements[2],
      });
    }

    // Finally ordering by created date and parsing the limit value.
    const results = await query
      .orderBy('todo.createdAt', 'DESC')
      .limit(replacements[0])
      .getMany();

    // If we found results, return
    if (results) {
      return {
        todos: results.slice(0, realLimit),
        hasMore: results.length === reaLimitPlusOne,
      };
    }
    return {
      errors: [
        {
          field: 'todos',
          message: 'Failed to retrieve todos',
        },
      ],
      todos: [],
      hasMore: false,
    };
  }
}
