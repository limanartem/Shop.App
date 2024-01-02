import { Resolvers } from '../generated/graphql';
import { shoppingCart } from './queries';
import { addToCart, removeFromCart, updateQuantity, deleteCart } from './mutations';

const resolvers: Resolvers = {
  Query: {
    shoppingCart,
  },
  Mutation: {
    addToCart,
    removeFromCart,
    updateQuantity,
    deleteCart,
  },
};

export default resolvers;
