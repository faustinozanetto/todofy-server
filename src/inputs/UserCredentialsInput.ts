import { Field, InputType } from 'type-graphql';

@InputType()
export class UserCredentialsInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}
