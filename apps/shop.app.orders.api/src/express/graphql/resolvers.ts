import { getOrder, getOrderExpanded, getOrders, getOrdersExpanded } from '../../domain/orders';
import { ResolverFn, Resolvers } from './__generated__/resolver-types';
import { SessionContext } from '.';
import { GraphQLResolveInfo } from 'graphql';
import { isFieldRequested } from './utils';
import { PubSub, withFilter } from 'graphql-subscriptions';

export const pubsub = new PubSub();
export const ORDER_CHANGED = 'ORDER_CHANGED';

/**
 * Root resolver object for GraphQL.
 * @typedef {Object} Resolvers
 * @property {Object} Query - Query resolvers.
 * @property {Object} Subscription - Subscription resolvers.
 */
const root: Resolvers = {
  Query: {
    orders: async (_: any, __: any, context: SessionContext, info: GraphQLResolveInfo) => {
      const { session } = context;
      if (session == null) {
        throw new Error('No session found');
      }

      const userId = session.getUserId();
      if (userId == null) {
        throw new Error('No user id found');
      }

      const requestedProductField = isFieldRequested('items.product', info);

      return await (requestedProductField ? getOrdersExpanded(userId) : getOrders(userId));
    },
    order: async (
      _,
      { id }: { id?: string },
      { session }: SessionContext,
      info: GraphQLResolveInfo,
    ) => {
      if (session == null) {
        throw new Error('No session found');
      }

      if (id == null) {
        throw new Error('No id found');
      }

      const userId = session.getUserId();
      if (userId == null) {
        throw new Error('No user id found');
      }

      const requestedProductField = isFieldRequested('items.product', info);

      return await (requestedProductField ? getOrderExpanded(id, userId) : getOrder(id, userId));
    },
  },
  Subscription: {
    orderChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ORDER_CHANGED) as AsyncIterator<any, any, undefined>,
        (payload, _, ctx) => {
          return payload.orderChanged.userId === ctx.userId;
        },
      ) as ResolverFn<any, {}, SessionContext, {}>,
    },
  },
};

export default root;
