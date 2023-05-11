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
 * @param {QueuingStrategy<T>} [writableStrategy] The strategy for the writable side of the channel.
 * @param {QueuingStrategy<T>} [readableStrategy] The strategy for the readable side of the channel.
 * @returns {{ reader: ReadableStream<T>, writer: WritableStream<T> }} A channel object containing a readable stream and a writable stream.
 */
export function channel<T>(
  writableStrategy?: QueuingStrategy<T>,
  readableStrategy?: QueuingStrategy<T>,
): Channel<T> {
  writableStrategy ??= new CountQueuingStrategy({ highWaterMark: 1 });
  readableStrategy ??= new CountQueuingStrategy({ highWaterMark: 0 });
  let readerCancelled = false;
  let readerController: ReadableStreamDefaultController<T>;
  const reader = new ReadableStream<T>({
    start(constroller) {
      readerController = constroller;
    },
    cancel() {
      readerCancelled = true;
    },
  }, readableStrategy);
  const writer = new WritableStream<T>({
    write(chunk) {
      readerController.enqueue(chunk);
    },
    close() {
      if (!readerCancelled) {
        readerController.close();
      }
    },
  }, writableStrategy);
  return { reader, writer };
}
