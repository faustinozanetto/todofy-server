import { Field, ObjectType } from 'type-graphql'

/**
 * Field error response.
 */
@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}
