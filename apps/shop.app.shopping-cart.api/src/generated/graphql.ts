import { GraphQLResolveInfo } from 'graphql';
import { RequestContext } from '../types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Mutation = {
  __typename?: 'Mutation';
  addToCart?: Maybe<ShoppingCart>;
  removeFromCart?: Maybe<ShoppingCart>;
  updateQuantity?: Maybe<ShoppingCart>;
};


export type MutationAddToCartArgs = {
  item: ShoppingCartItemInput;
};


export type MutationRemoveFromCartArgs = {
  productId: Scalars['String']['input'];
};


export type MutationUpdateQuantityArgs = {
  productId: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
};

export type ProductItemSnapshot = {
  __typename?: 'ProductItemSnapshot';
  currency?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  price: Scalars['Float']['output'];
  title?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  shoppingCart?: Maybe<ShoppingCart>;
};

export type ShoppingCart = {
  __typename?: 'ShoppingCart';
  id: Scalars['ID']['output'];
  items?: Maybe<Array<ShoppingCartItem>>;
  userId: Scalars['ID']['output'];
};

export type ShoppingCartItem = {
  __typename?: 'ShoppingCartItem';
  product?: Maybe<ProductItemSnapshot>;
  productId: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
};

export type ShoppingCartItemInput = {
  productId: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  ProductItemSnapshot: ResolverTypeWrapper<ProductItemSnapshot>;
  Query: ResolverTypeWrapper<{}>;
  ShoppingCart: ResolverTypeWrapper<ShoppingCart>;
  ShoppingCartItem: ResolverTypeWrapper<ShoppingCartItem>;
  ShoppingCartItemInput: ShoppingCartItemInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  ProductItemSnapshot: ProductItemSnapshot;
  Query: {};
  ShoppingCart: ShoppingCart;
  ShoppingCartItem: ShoppingCartItem;
  ShoppingCartItemInput: ShoppingCartItemInput;
  String: Scalars['String']['output'];
};

export type MutationResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addToCart?: Resolver<Maybe<ResolversTypes['ShoppingCart']>, ParentType, ContextType, RequireFields<MutationAddToCartArgs, 'item'>>;
  removeFromCart?: Resolver<Maybe<ResolversTypes['ShoppingCart']>, ParentType, ContextType, RequireFields<MutationRemoveFromCartArgs, 'productId'>>;
  updateQuantity?: Resolver<Maybe<ResolversTypes['ShoppingCart']>, ParentType, ContextType, RequireFields<MutationUpdateQuantityArgs, 'productId' | 'quantity'>>;
};

export type ProductItemSnapshotResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['ProductItemSnapshot'] = ResolversParentTypes['ProductItemSnapshot']> = {
  currency?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  shoppingCart?: Resolver<Maybe<ResolversTypes['ShoppingCart']>, ParentType, ContextType>;
};

export type ShoppingCartResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['ShoppingCart'] = ResolversParentTypes['ShoppingCart']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  items?: Resolver<Maybe<Array<ResolversTypes['ShoppingCartItem']>>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShoppingCartItemResolvers<ContextType = RequestContext, ParentType extends ResolversParentTypes['ShoppingCartItem'] = ResolversParentTypes['ShoppingCartItem']> = {
  product?: Resolver<Maybe<ResolversTypes['ProductItemSnapshot']>, ParentType, ContextType>;
  productId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = RequestContext> = {
  Mutation?: MutationResolvers<ContextType>;
  ProductItemSnapshot?: ProductItemSnapshotResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ShoppingCart?: ShoppingCartResolvers<ContextType>;
  ShoppingCartItem?: ShoppingCartItemResolvers<ContextType>;
};

