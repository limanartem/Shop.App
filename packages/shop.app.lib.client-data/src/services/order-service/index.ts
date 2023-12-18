import { CreateOrder, Order, OrdersResponse } from '../../model';
import rest from './orders-rest-api';
import graphQl from './orders-graphql';

export interface OrderService {
  getOrdersAsync(): Promise<OrdersResponse>;
  getOrderAsync(id: string): Promise<Order | undefined>;
  createOrdersAsync(order: CreateOrder): Promise<{ id: string }>;
}

export class OrderServiceClient implements OrderService {
  private service: OrderService;

  constructor(env: Record<string, string>) {
    const { REACT_APP_ORDERS_API_PROVIDER = 'graphql' } = env;
    this.service = REACT_APP_ORDERS_API_PROVIDER === 'graphql' ? graphQl(env) : rest(env);
  }
  public async getOrdersAsync(): Promise<OrdersResponse> {
    return this.service.getOrdersAsync();
  }

  getOrderAsync(id: string): Promise<Order | undefined> {
    return this.service.getOrderAsync(id);
  }
  createOrdersAsync(order: CreateOrder): Promise<{ id: string }> {
    return this.service.createOrdersAsync(order);
  }
}
