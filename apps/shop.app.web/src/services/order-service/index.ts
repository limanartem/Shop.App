import { CreateOrder, Order, OrdersResponse } from '../../model';
import * as rest from './orders-rest-api';

export const getOrdersAsync = async (): Promise<OrdersResponse> => rest.getOrdersAsync();

export const getOrderAsync = async (id: string): Promise<Order | undefined> =>
  rest.getOrderAsync(id);

export const createOrdersAsync = async (order: CreateOrder): Promise<{ id: string }> =>
  rest.createOrdersAsync(order);
