import { deferred } from "https://deno.land/std@0.186.0/async/mod.ts";
import { Queue } from "https://deno.land/x/async@v2.0.2/queue.ts";

export type Channel<T> = {
  reader: ReadableStream<T>;
  writer: WritableStream<T>;
};

/**
 * Creates a new channel, which is a pair of a readable and writable stream.
 *
 * ```ts
 * import { channel } from "./channel.ts";
 * import { push } from "./push.ts";
 * import { pop } from "./pop.ts";
 *
 * const { reader, writer } = channel<number>();
 *
 * await push(writer, 1);
 * await push(writer, 2);
 * await push(writer, 3);
 * console.log(await pop(reader)); // 1
 * console.log(await pop(reader)); // 2
 * console.log(await pop(reader)); // 3
 * ```
 *
 * @template T The type of the elements that the channel can handle.
 * @returns {{ reader: ReadableStream<T>, writer: WritableStream<T> }} A channel object containing a readable stream and a writable stream.
 */
export function channel<T>(): Channel<T> {
  const closed = Symbol("closed");
  const waiter = deferred<typeof closed>();
  const queue = new Queue<T>();
  const reader = new ReadableStream<T>({
    async pull(controller) {
      const chunk = await Promise.race([queue.pop(), waiter]);
      if (chunk === closed) {
        controller.close();
      } else {
        controller.enqueue(chunk);
      }
    },
  });
  const writer = new WritableStream<T>({
    write(chunk) {
      queue.push(chunk);
    },
    close() {
      waiter.resolve(closed);
    },
  });
  return { reader, writer };
}
