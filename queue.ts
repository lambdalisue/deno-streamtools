import { Deferred, deferred } from "https://deno.land/std@0.185.0/async/mod.ts";

export class QueueClosedError extends Error {
  constructor() {
    super("Queue is closed");
    this.name = this.constructor.name;
  }
}

export class QueueEnqueueLockedError extends Error {
  constructor() {
    super("'enqueue' is not available when 'writable' is referred");
    this.name = this.constructor.name;
  }
}

export class QueueDequeueLockedError extends Error {
  constructor() {
    super("'dequeue' is not available when 'readable' is referred");
    this.name = this.constructor.name;
  }
}

export class Queue<T> {
  #queue: T[] = [];
  #closed = false;
  #waiter?: Deferred<void>;
  #readable?: ReadableStream<T>;
  #writable?: WritableStream<T>;

  #getWaiter(): Deferred<void> {
    if (!this.#waiter) {
      this.#waiter = deferred();
    }
    return this.#waiter;
  }

  get closed(): boolean {
    return this.#closed;
  }

  get size(): number {
    return this.#queue.length;
  }

  get readable(): ReadableStream<T> {
    if (!this.#readable) {
      this.#readable = new ReadableStream<T>({
        pull: async (controller) => {
          try {
            controller.enqueue(await this.#dequeue());
          } catch (err: unknown) {
            if (err instanceof QueueClosedError) {
              controller.close();
            } else {
              controller.error(err);
            }
          }
        },
      });
    }
    return this.#readable;
  }

  get writable(): WritableStream<T> {
    if (!this.#writable) {
      this.#writable = new WritableStream<T>({
        write: (chunk, controller) => {
          try {
            this.#enqueue(chunk);
          } catch (err: unknown) {
            controller.error(err);
          }
        },
        close: () => {
          this.close();
        },
      });
    }
    return this.#writable;
  }

  #enqueue(value: T) {
    if (this.#closed) {
      throw new QueueClosedError();
    }
    this.#queue.push(value);
    this.#waiter?.resolve();
  }

  async #dequeue(): Promise<T> {
    while (!this.#closed || this.#queue.length > 0) {
      if (this.#queue.length > 0) {
        return this.#queue.shift()!;
      }
      await this.#getWaiter();
    }
    throw new QueueClosedError();
  }

  enqueue(value: T): void {
    if (this.#writable) {
      throw new QueueEnqueueLockedError();
    }
    return this.#enqueue(value);
  }

  dequeue(): Promise<T> {
    if (this.#readable) {
      throw new QueueDequeueLockedError();
    }
    return this.#dequeue();
  }

  close(): void {
    this.#closed = true;
    this.#waiter?.resolve();
  }
}
