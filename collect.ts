/**
 * Reads all chunks from a readable stream and returns them as an array of chunks.
 *
 * ```ts
 * import { collect } from "./collect.ts";
 *
 * const reader = new ReadableStream<number>({
 *   start(controller) {
 *     controller.enqueue(1);
 *     controller.enqueue(2);
 *     controller.enqueue(3);
 *     controller.close();
 *   },
 * });
 *
 * console.log(await collect(reader)); // [1, 2, 3]
 * ```
 *
 * @template T The type of the chunks to be read from the stream.
 * @param {ReadableStream<T>} stream The readable stream to read chunks from.
 * @param {PipeOptions} [options={}] Options for configuring the piping behavior.
 * @param {AbortSignal} [options.signal] AbortSignal to abort ongoing pipe operation.
 * @param {boolean} [options.preventCancel] Prevent the source from being canceled.
 * @param {boolean} [options.preventClose] Prevent the source from being closed.
 * @param {boolean} [options.preventAbort] Prevent the source from being aborted.
 * @returns {Promise<T[]>} A promise that resolves with an array of all the chunks read from the stream.
 */
export async function collect<T>(
  stream: ReadableStream<T>,
  options: PipeOptions = {},
): Promise<T[]> {
  const chunks: T[] = [];
  await stream.pipeTo(
    new WritableStream({
      write(chunk) {
        chunks.push(chunk);
      },
    }),
    options,
  );
  return chunks;
}
