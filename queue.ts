import { Deferred, deferred } from "https://deno.land/std@0.185.0/async/mod.ts";

/**
 * Error thrown when trying to enqueue/dequeue on a closed queue.
 */
export class QueueClosedError extends Error {
  constructor() {
    super("Queue is closed");
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when trying to enqueue while the writable stream is being referred.
 */
export class QueueEnqueueLockedError extends Error {
  constructor() {
    super("'enqueue' is not available when 'writable' is referred");
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when trying to dequeue while the readable stream is being referred.
 */
export class QueueDequeueLockedError extends Error {
  constructor() {
    super("'dequeue' is not available when 'readable' is referred");
    this.name = this.constructor.name;
  }
}

/**
 * A queue with ReadableStream and WritableStream supports.
 */
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

  /**
   * Whether the queue is closed or not.
   */
  get closed(): boolean {
    return this.#closed;
  }

  /**
   * The number of values in the queue.
   */
  get size(): number {
    return this.#queue.length;
  }

  /**
   * A readable stream that reads values from the queue.
   */
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

  /**
   * A writable stream that writes values to the queue.
   */
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

  /**
   * Enqueues a value to the queue.
   */
  enqueue(value: T): void {
    if (this.#writable) {
      throw new QueueEnqueueLockedError();
    }
    return this.#enqueue(value);
  }

  /**
   * Dequeues a value from the queue.
   */
  dequeue(): Promise<T> {
    if (this.#readable) {
      throw new QueueDequeueLockedError();
    }
    return this.#dequeue();
  }

  /**
   * Closes the queue.
   */
  close(): void {
    this.#closed = true;
    this.#waiter?.resolve();
  }
}
