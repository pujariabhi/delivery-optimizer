import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { WebSocketEvent } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

type EventCallback = (event: WebSocketEvent) => void;

class WebSocketService {
  private client: Client | null = null;
  private isConnected: boolean = false;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  constructor() {
    this.listeners.set('/topic/vehicle-locations', new Set());
    this.listeners.set('/topic/order-updates', new Set());
    this.listeners.set('/topic/route-updates', new Set());
    this.listeners.set('/topic/traffic-updates', new Set());
    this.listeners.set('/topic/optimization-events', new Set());
  }

  public connect(onConnected?: () => void) {
    if (this.client && this.isConnected) return;

    try {
      this.client = new Client({
        webSocketFactory: () => {
          const SockJSClass = (SockJS as any).default || SockJS;
          return new SockJSClass(WS_URL);
        },
        reconnectDelay: 3000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: () => {},
      });

    this.client.onConnect = () => {
      this.isConnected = true;
      console.log('Connected to Spring Boot STOMP WebSocket broker');

      // Subscribe to all topics
      this.listeners.forEach((_, topic) => {
        this.client?.subscribe(topic, (message: any) => {
          try {
            const data: WebSocketEvent = JSON.parse(message.body);
            const callbacks = this.listeners.get(topic);
            callbacks?.forEach((cb) => cb(data));
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        });
      });

      if (onConnected) onConnected();
    };

    this.client.onDisconnect = () => {
      this.isConnected = false;
      console.log('Disconnected from STOMP WebSocket broker');
    };

    this.client.onStompError = (frame) => {
      console.warn('STOMP protocol error:', frame.headers['message']);
    };

    this.client.activate();
    } catch (err) {
      console.warn('Failed to initialize WebSocket client:', err);
    }
  }

  public subscribe(topic: string, callback: EventCallback): () => void {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
      if (this.isConnected && this.client) {
        this.client.subscribe(topic, (message: any) => {
          try {
            const data: WebSocketEvent = JSON.parse(message.body);
            this.listeners.get(topic)?.forEach((cb) => cb(data));
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        });
      }
    }

    this.listeners.get(topic)?.add(callback);

    // Return unsubscribe callback
    return () => {
      this.listeners.get(topic)?.delete(callback);
    };
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
    }
  }

  public getStatus() {
    return this.isConnected;
  }
}

export const wsService = new WebSocketService();
