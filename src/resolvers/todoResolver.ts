import { Arg, Int, Mutation, Query, Resolver } from 'type-graphql';
import {
  TodoResponse,
  TodosResponse,
  TodoDeleteResponse,
} from '../responses/todo';
import { Todo, User } from '../entities';
import { TodoCreateInput, TodoDeleteInput } from '../inputs/todo';

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
      };
    }

    return { todos };
  }

  /**
   *
   * @param input Input parameters required for creating a Todo.
   * @returns if created, the todo object.
   */
  @Mutation(() => TodoResponse)
  async createTodo(
    @Arg('input') input: TodoCreateInput
  ): Promise<TodoResponse> {
    const user = await User.findOne(input.user);
    if (!user) {
      return {
        errors: [
          {
            field: 'todo',
            message: 'Could not find a User with the given id!',
          },
        ],
      };
    }
    const todo = await Todo.create({
      ...input,
      title: input.title,
      description: input.description,
      completed: input.completed,
      user: user,
    }).save();

    return { todo };
  }

  /**
   *
   * @param input Input parameters required for deleting a Todo.
   * @returns return true or false wether we deleted or not the Todo.
   */
  @Mutation(() => TodoDeleteResponse)
  async deleteTodo(
    @Arg('input') input: TodoDeleteInput
  ): Promise<TodoDeleteResponse> {
    await Todo.delete(input.id);
    return { deleted: true };
  }
}
