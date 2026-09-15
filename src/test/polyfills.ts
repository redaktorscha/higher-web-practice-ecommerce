import { TextDecoder, TextEncoder } from 'node:util';

Object.assign(globalThis, {
  TextDecoder,
  TextEncoder,
});

class HeadersMock {
  private readonly headers = new Map<string, string>();

  constructor(init: Record<string, string> = {}) {
    Object.entries(init).forEach(([key, value]) => {
      this.headers.set(key.toLowerCase(), value);
    });
  }

  get(name: string) {
    return this.headers.get(name.toLowerCase()) ?? null;
  }
}

class ResponseMock {
  readonly headers: HeadersMock;
  readonly ok: boolean;
  readonly status: number;

  constructor(private readonly body: string | null = null, init: { status?: number; headers?: Record<string, string> } = {}) {
    this.status = init.status ?? 200;
    this.ok = this.status >= 200 && this.status < 300;
    this.headers = new HeadersMock(init.headers);
  }

  clone() {
    return new ResponseMock(this.body, {
      status: this.status,
    });
  }

  async json() {
    return this.body ? JSON.parse(this.body) : null;
  }

  async text() {
    return this.body ?? '';
  }
}

class RequestMock {
  readonly body: BodyInit | null;
  readonly method: string;
  readonly url: string;

  constructor(input: string | RequestMock, init: RequestInit = {}) {
    this.url = typeof input === 'string' ? input : input.url;
    this.method = init.method ?? (typeof input === 'string' ? 'GET' : input.method);
    this.body = init.body ?? (typeof input === 'string' ? null : input.body);
  }

  clone() {
    return new RequestMock(this.url, {
      method: this.method,
      body: this.body,
    });
  }

  async text() {
    return typeof this.body === 'string' ? this.body : '';
  }
}

Object.assign(globalThis, {
  Headers: globalThis.Headers ?? HeadersMock,
  Request: globalThis.Request ?? RequestMock,
  Response: globalThis.Response ?? ResponseMock,
  fetch: globalThis.fetch ?? jest.fn(),
});
