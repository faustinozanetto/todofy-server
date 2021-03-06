import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import { getConnection } from 'typeorm'

import { TodoDeleteResponse, TodoResponse, TodosResponse } from '../responses/todo'
import { Todo } from '../entities'
import { TodoCreateInput, TodoDeleteInput } from '../inputs/todo'
import { isAuth } from '../middleawares/auth'
import { TodofyContext } from '../types'

@Resolver()
export class TodoResolver {
  /**
   *
   * @param id of the todo we are going to search.
   * @returns if found, the Todo associated with the given id.
   */
  @Query(() => TodoResponse)
  async todo(@Arg('id', () => Int) id: number): Promise<TodoResponse> {
    const todo = await Todo.findOne(id);

    if (!todo) {
      return {
        errors: [
          {
            field: 'todo',
            message: 'No todo with that given id was found!',
          },
        ],
      };
    }
    return { todo };
  }

  /**
   *
   * @returns all the todos in the database.
   */
  @Query(() => TodosResponse)
  async todos(): Promise<TodosResponse> {
    const todos = await Todo.find();

    if (!todos) {
      return {
        errors: [
          {
            field: 'todos',
            message: 'There has been an error while trying to search todos!',
          },
        ],
        todos: [],
        hasMore: false,
      };
    }

    return { todos, hasMore: false };
  }

  /**
   *
   * @param input Input parameters required for creating a Todo.
   * @returns if created, the todo object.
   */
  @Mutation(() => TodoResponse)
  @UseMiddleware(isAuth)
  async createTodo(
    @Arg('input') input: TodoCreateInput,
    @Ctx() { payload }: TodofyContext
  ): Promise<TodoResponse> {
    return {
      todo: await Todo.create({
        ...input,
        creatorId: parseInt(payload?.userId!),
      }).save(),
    };
  }

  /**
   *
   * @param input Input parameters required for deleting a Todo.
   * @returns return true or false wether we deleted or not the Todo.
   */
  @Mutation(() => TodoDeleteResponse)
  @UseMiddleware(isAuth)
  async deleteTodo(
    @Arg('input') input: TodoDeleteInput,
    @Ctx() { payload }: TodofyContext
  ): Promise<TodoDeleteResponse> {
    await Todo.delete({ id: input.id, creatorId: parseInt(payload?.userId!) });
    return { deleted: true };
  }

  @Mutation(() => TodoResponse, { nullable: true })
  @UseMiddleware(isAuth)
  async updateTodo(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('description') description: string,
    @Arg('completed') completed: boolean,
    @Ctx() { payload }: TodofyContext
  ): Promise<TodoResponse | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Todo)
      .set({ title, description, completed })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        completed,
        creatorId: payload?.userId,
      })
      .returning('*')
      .execute();

    return {
      todo: result.raw[0],
    };
  }
}
