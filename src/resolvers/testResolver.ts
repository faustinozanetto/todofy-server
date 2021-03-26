import { Query, Resolver } from 'type-graphql';

@Resolver()
export class TestResolver {
  @Query(() => String)
  async testString(): Promise<String> {
    return 'Hello World';
  }
}
