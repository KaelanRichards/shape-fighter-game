export class WebSocketClient {
  private socket: WebSocket | null = null;
  private messageHandler: ((message: any) => void) | null = null;

  constructor(private url: string) {}

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.url);
      this.socket.onopen = () => resolve();
      this.socket.onerror = (error) => reject(error);
      this.socket.onmessage = (event) => {
        if (this.messageHandler) {
          this.messageHandler(JSON.parse(event.data));
        }
      };
    });
  }

  public send(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  public onMessage(handler: (message: any) => void): void {
    this.messageHandler = handler;
  }

  public onOpen(handler: () => void): void {
    if (this.socket) {
      this.socket.addEventListener("open", handler);
    }
  }

  public onClose(handler: () => void): void {
    if (this.socket) {
      this.socket.onclose = handler;
    }
  }

  public close(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
