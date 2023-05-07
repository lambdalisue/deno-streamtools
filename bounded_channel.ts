import { deferred } from "https://deno.land/std@0.186.0/async/mod.ts";
import { Queue } from "https://deno.land/x/async@v2.0.2/queue.ts";
import { Notify } from "https://deno.land/x/async@v2.0.2/notify.ts";

/**
 * Creates a new bounded channel, which is a pair of a readable and writable stream with a fixed capacity.
 *
 * ```ts
 * import { boundedChannel } from "./bounded_channel.ts";
 * import { push } from "./push.ts";
 * import { pop } from "./pop.ts";
 *
 * const [reader, writer] = boundedChannel<number>(3);
 *
 * await push(writer, 1);
 * await push(writer, 2);
 * await push(writer, 3);
 * // The following line never resolves because the channel is full.
 * //await push(writer, 4);
 * console.log(await pop(reader)); // 1
 * // Now the channel is not full anymore so the following line resolves.
 * await push(writer, 4);
 * console.log(await pop(reader)); // 2
 * console.log(await pop(reader)); // 3
 * console.log(await pop(reader)); // 4
 * ```
 *
 * @template T The type of the elements that the channel can handle.
 * @param {number} capacity The maximum number of elements that the channel can hold at any time.
 * @returns {[ReadableStream<T>, WritableStream<T>]} A tuple containing a readable stream and a writable stream.
 */
export function boundedChannel<T>(capacity: number): [
  ReadableStream<T>,
  WritableStream<T>,
] {
  const closed = Symbol("closed");
  const notify = new Notify();
  const waiter = deferred<typeof closed>();
  const queue = new Queue<T>();
  const reader = new ReadableStream<T>({
    async pull(controller) {
      const chunk = await Promise.race([queue.pop(), waiter]);
      if (chunk === closed) {
        controller.close();
      } else {
        controller.enqueue(chunk);
        notify.notify();
      }
    },
  });
  const writer = new WritableStream<T>({
    async write(chunk) {
      // The readable stream pull the first item automatically so the actual
      // number of items in the channel is queue.size + 1.
      if (queue.size + 1 >= capacity) {
        await notify.notified();
      }
      queue.push(chunk);
    },
    close() {
      waiter.resolve(closed);
    },
  });
  return [reader, writer];
}
