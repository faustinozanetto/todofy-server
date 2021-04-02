import { Field, ObjectType } from 'type-graphql'

import { Todo } from '../../entities'
import { FieldError } from '../FieldError'

/**
 * Response used when running User Related queries.
 */
@ObjectType()
export class TodoResponse {
  /**
   * Error
   */
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  /**
   * Todo
   */
  @Field(() => Todo, { nullable: true })
  todo?: Todo;
}
