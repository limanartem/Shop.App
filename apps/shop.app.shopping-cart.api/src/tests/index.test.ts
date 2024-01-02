import request from 'supertest';
import createApolloServer, { RequestContext } from '../apollo-server';
import { ApolloServer } from '@apollo/server';

describe('shopping-cart api', () => {
  let server: ApolloServer<RequestContext>, url: string;

  beforeAll(async () => {
    ({ server, url } = await createApolloServer());
  });

  afterAll(async () => {
    await server?.stop();
  });

  it('should return 200', async () => {
    await request(url).post('.').send({ query: 'query {shoppingCart { userId} }' }).expect(200);
  });
});
