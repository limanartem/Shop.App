import { getOrder, getOrders, getOrdersExpanded } from '../../data-utils';
import { Resolvers } from './__generated__/resolver-types';
import { SessionContext } from '.';
import { GraphQLResolveInfo } from 'graphql';
import { isFieldRequested } from './utils';

const root: Resolvers = {
  Query: {
    orders: async (_: any, __: any, context: SessionContext, info: GraphQLResolveInfo) => {
      const { session } = context;
      if (session == null) {
        throw new Error('No session found');
      }
      const userId = session.getUserId();

      const requestedProductField = isFieldRequested('items.product', info);

      return await (requestedProductField ? getOrdersExpanded(userId) : getOrders(userId));
    },
    order: async (_, { id }: { id?: string }, { session }: SessionContext) => {
      if (session == null) {
        throw new Error('No session found');
      }

      if (id == null) {
        throw new Error('No id found');
      }
      const userId = session.getUserId();

      return await getOrder(id, userId);
    },
  },
};

export default root;