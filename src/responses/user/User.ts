import { Field, ObjectType } from 'type-graphql'

import { User } from '../../entities'
import { FieldError } from '.'

/**
 * Response used when running User Related queries.
 */
@ObjectType()
export class UserResponse {
  /**
   * Error
   */
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  /**
   * User
   */
  @Field(() => User, { nullable: true })
  user?: User;

  /**
   * Access token
   */
  @Field(() => String, { nullable: true })
  accessToken?: string;
}
