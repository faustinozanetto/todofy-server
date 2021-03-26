import { Field, InputType, Int } from 'type-graphql';

@InputType()
export class TodoDeleteInput {
  @Field(() => Int)
  id: number;
}
