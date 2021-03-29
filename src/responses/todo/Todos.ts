import { ObjectType, Field } from 'type-graphql';
import { Todo } from '../../entities';
import { FieldError } from '../FieldError';

/**
 * Response used when running the user todos Query.
 */
@ObjectType()
export class TodosResponse {
  /**
   * Error variable when something has gone wrong.
   */
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => [Todo])
  todos: Todo[];

  @Field(() => Boolean)
  hasMore: boolean;
}
