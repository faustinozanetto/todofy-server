import { User } from '../../entities';
import { ObjectType, Field } from 'type-graphql';
import { FieldError } from '.';

@ObjectType()
export class LoginResponse {
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

  @Field(() => String, { nullable: true })
  accessToken?: string;
}
