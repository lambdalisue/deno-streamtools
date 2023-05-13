export type WriteAllOptions = PipeOptions & {
  /** The size of each chunk to write to the stream */
  chunkSize?: number;
};

/**
 * Writes all data in a Uint8Array to a writable stream in chunk-size units.
 *
 * ```ts
 * import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";
 * import { writeAll } from "./write_all.ts";
 *
 * const encoder = new TextEncoder();
 * const chunks: Uint8Array[] = [];
 * const stream = new WritableStream({
 *   write(chunk) {
 *     chunks.push(chunk);
 *   },
 * });
 * await writeAll(stream, encoder.encode("HelloWorld"), { chunkSize: 3 });
 * assertEquals(chunks, [
 *   encoder.encode("Hel"),
 *   encoder.encode("loW"),
 *   encoder.encode("orl"),
 *   encoder.encode("d"),
 * ]);
 * ```
 *
 * @param {WritableStream<Uint8Array>} stream The stream to write to.
 * @param {Uint8Array} data The data to write.
 * @param {WriteAllOptions} [options={}] Options for configuring the piping behavior.
 * @param {AbortSignal} [options.signal] AbortSignal to abort ongoing pipe operation.
 * @param {boolean} [options.preventCancel] Prevent the source from being canceled.
 * @param {boolean} [options.preventClose] Prevent the source from being closed.
 * @param {boolean} [options.preventAbort] Prevent the source from being aborted.
 * @param {number} [options.chunkSize=1024] The size of each chunk to write to the stream.
 * @returns {Promise<void>} A promise that resolves when all the data has been written to the stream.
 */
export async function writeAll(
  stream: WritableStream<Uint8Array>,
  data: Uint8Array,
  options: WriteAllOptions = {},
): Promise<void> {
  const { chunkSize = 1024, ...rest } = options;
  const input = new ReadableStream({
    start(controller) {
      let offset = 0;
      while (offset < data.length) {
        controller.enqueue(data.subarray(offset, offset + chunkSize));
        offset += chunkSize;
      }
      controller.close();
    },
  });
  await input.pipeTo(stream, rest);
}
