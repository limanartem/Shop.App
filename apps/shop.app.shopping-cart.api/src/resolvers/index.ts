import { Resolvers } from '../generated/graphql';
import { shoppingCart } from './queries';
import { addToCart, removeFromCart, updateQuantity } from './mutations';

const resolvers: Resolvers = {
  Query: {
    shoppingCart,
  },
  Mutation: {
    addToCart,
    removeFromCart,
    updateQuantity,
  },
};

export default resolvers;
