/**
 * Provides the given values to the writable stream by piping them from a readable stream
 * created from the values. Returns a promise that resolves when all the values have been
 * successfully written to the stream.
 *
 * ```ts
 * import { provide } from "./provide.ts";
 *
 * const results: number[] = [];
 * const writer = new WritableStream<number>({
 *   write(chunk) {
 *     results.push(chunk);
 *   },
 * });
 *
 * await provide(writer, [1, 2, 3]);
 * console.log(results); // [1, 2, 3]
 * ```
 *
 * @param {WritableStream<T>} stream The writable stream to write the values to.
 * @param {T[]} values An array of values to write to the stream.
 * @param {PipeOptions} [options={}] Options for configuring the piping behavior.
 * @param {AbortSignal} [options.signal] AbortSignal to abort ongoing pipe operation.
 * @param {boolean} [options.preventCancel] Prevent the source from being canceled.
 * @param {boolean} [options.preventClose] Prevent the source from being closed.
 * @param {boolean} [options.preventAbort] Prevent the source from being aborted.
 * @returns {Promise<void>} A promise that resolves when all values have been successfully written to the stream.
 */
export async function provide<T>(
  stream: WritableStream<T>,
  values: T[],
  options: PipeOptions = {},
): Promise<void> {
  const input = new ReadableStream({
    start(controller) {
      values.forEach((value) => controller.enqueue(value));
      controller.close();
    },
  });
  await input.pipeTo(stream, options);
}
