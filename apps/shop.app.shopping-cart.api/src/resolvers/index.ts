import { Resolvers } from '../generated/graphql';
import { shoppingCart } from './queries';
import { addToCart, removeFromCart, updateQuantity, deleteCart, mergeCart } from './mutations';

const resolvers: Resolvers = {
  Query: {
    shoppingCart,
  },
  Mutation: {
    addToCart,
    removeFromCart,
    updateQuantity,
    deleteCart,
    merge: mergeCart,
  },
};

export default resolvers;
