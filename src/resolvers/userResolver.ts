import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';
import { UsersResponse, UserResponse } from '../responses/user';
import { getConnection, getRepository } from 'typeorm';
import { TodofyContext } from 'types';
import { User } from '../entities';
import { validateUserRegistration } from '../utils';
import { UserCredentialsInput } from '../inputs';
import argon2 from 'argon2';
import { logger } from '../index';
import { sign } from 'jsonwebtoken';
import { LogLevel } from '../logger';
import { __cookie__, __secret__ } from '../utils/constants';
import { TodosResponse } from '../responses/todo/Todos';

@Resolver()
export class UserResolver {
  @Query(() => UsersResponse)
  async getUsers(): Promise<UsersResponse> {
    const users = await User.find();
    if (users) {
      return {
        users,
      };
    }

    return {
      errors: [{ field: 'users', message: 'Failed to retrieve Users!' }],
    };
  }

  /**
   *
   * @param input User register input
   * @param ctx Todofy Context
   * @returns If input is valid, return registered User
   */
  @Mutation(() => UserResponse)
  async register(
    @Arg('input') input: UserCredentialsInput,
    @Ctx() { req }: TodofyContext
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

    const auth = sign(
      { id: user.id, email: user.email },
      'mrFFmHzpWNVPLGIm71rEmTtT23dL8r',
      {
        expiresIn: '24h',
      }
    );

    console.log({ auth });
    req.session.userId = user.id;

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
    @Arg('username') username: string,
    @Arg('password') password: string,
    @Ctx() { req }: TodofyContext
  ): Promise<UserResponse> {
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

    // De-hashing password
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return {
        errors: [{ field: 'password', message: 'Password does not match!' }],
      };
    }

    req.session.userId = user.id;

    const auth = sign(
      { id: user.id, email: user.email },
      'mrFFmHzpWNVPLGIm71rEmTtT23dL8r',
      { expiresIn: '24h' }
    );

    console.log({ auth });

    return { user };
  }

  /**
   *
   * @param ctx Todofy Context
   * @returns True or False wether logout was successful or not.
   */
  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: TodofyContext) {
    return new Promise<boolean>((resolve) => {
      req.session.destroy((error: any) => {
        res.clearCookie(__cookie__);
        if (error) {
          logger.log(LogLevel.ERROR, error);
          resolve(error);
          return;
        }
        resolve(true);
      });
    });
  }

  /**
   * @param ctx Todofy Context
   * @returns Current user logged in the page.
   */
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: TodofyContext) {
    const userId = req.session.userId;
    if (!userId) {
      return null;
    }
    return User.findOne(userId);
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
