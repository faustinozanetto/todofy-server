import { Field, ObjectType } from 'type-graphql'

import { Todo } from '../../entities'
import { FieldError } from '../FieldError'

/**
 * Response used when running the User Todos Query.
 */
@ObjectType()
export class UserTodosResponse {
  /**
   * Error variable when something has gone wrong.
   */
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => [Todo], { nullable: true })
  todos?: Todo[];
}
