import { Field, InputType, Int } from 'type-graphql';

@InputType()
export class TodoCreateInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field(() => Boolean)
  completed: boolean;

  @Field(() => Int)
  user: number;
}
