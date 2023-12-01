import { getOrder, getOrders } from '../../data-utils';
import { SessionContainerInterface } from 'supertokens-node/lib/build/recipe/session/types';

const root = {
  orders: async (_: any, { session }: { session: SessionContainerInterface }) => {
    if (session == null) {
      throw new Error('No session found');
    }
    const userId = session.getUserId();

    return await getOrders(userId);
  },
  order: async ({ id }: { id: string }, { session }: { session: SessionContainerInterface }) => {
    if (session == null) {
      throw new Error('No session found');
    }

    if (id == null) {
      throw new Error('No id found');
    }
    const userId = session.getUserId();

    return await getOrder(id, userId);
  },
};

export default root;
