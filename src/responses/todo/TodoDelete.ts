import { ObjectType, Field } from 'type-graphql';
import { FieldError } from '../FieldError';

/**
 * Response used when running User Related queries.
 */
@ObjectType()
export class TodoDeleteResponse {
  /**
   * Error
   */
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  /**
   * Deleted
   */
  @Field(() => Boolean, { nullable: true })
  deleted?: Boolean;
}
