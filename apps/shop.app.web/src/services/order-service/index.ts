import { CreateOrder, Order, OrdersResponse } from '../../model';
import { env } from '../../config/environment';
import rest from './orders-rest-api';
import graphQl from './orders-graphql';

const { REACT_APP_ORDERS_API_PROVIDER = 'graphql' } = env;

const service = REACT_APP_ORDERS_API_PROVIDER === 'graphql' ? graphQl : rest;

export interface OrderService {
  getOrdersAsync(): Promise<OrdersResponse>;
  getOrderAsync(id: string): Promise<Order | undefined>;
  createOrdersAsync(order: CreateOrder): Promise<{ id: string }>;
}

export const getOrdersAsync = async (): Promise<OrdersResponse> => service.getOrdersAsync();

export const getOrderAsync = async (id: string): Promise<Order | undefined> =>
  service.getOrderAsync(id);

export const createOrdersAsync = async (order: CreateOrder): Promise<{ id: string }> =>
  service.createOrdersAsync(order);
