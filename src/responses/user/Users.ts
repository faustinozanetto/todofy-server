import { ObjectType, Field } from 'type-graphql';
import { User } from '../../entities';
import { FieldError } from '../FieldError';

/**
 * Response used when running the getUsers Query.
 */
@ObjectType()
export class UsersResponse {
  /**
   * Error variable when something has gone wrong.
   */
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => [User], { nullable: true })
  users?: User[];
}
