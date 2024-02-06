/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type DeleteResult = {
  __typename?: 'DeleteResult';
  deleted: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addToCart?: Maybe<ShoppingCart>;
  deleteCart?: Maybe<DeleteResult>;
  merge?: Maybe<ShoppingCart>;
  removeFromCart?: Maybe<ShoppingCart>;
  updateQuantity?: Maybe<ShoppingCart>;
};


export type MutationAddToCartArgs = {
  item: ShoppingCartItemInput;
};


export type MutationMergeArgs = {
  input?: InputMaybe<ShoppingCartMergeInput>;
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

export type ShoppingCartMergeInput = {
  items?: InputMaybe<Array<ShoppingCartItemInput>>;
};
