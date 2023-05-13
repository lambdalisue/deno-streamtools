import { concat } from "https://deno.land/std@0.187.0/bytes/mod.ts";
import { collect } from "./collect.ts";

/**
 * Reads all available bytes from a given `ReadableStream<Uint8Array>` and concatenates them into a single `Uint8Array`.
 *
 * ```ts
 * import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";
 * import { readAll } from "./read_all.ts";
 *
 * const encoder = new TextEncoder();
 * const stream = new ReadableStream({
 *   start(controller) {
 *     controller.enqueue(encoder.encode("Hello"));
 *     controller.enqueue(encoder.encode("World"));
 *     controller.close();
 *   },
 * });
 * const result = await readAll(stream);
 * assertEquals(result, encoder.encode("HelloWorld"));
 * ```
 *
 * @param {ReadableStream<Uint8Array>} stream The stream to read from.
 * @param {PipeOptions} [options={}] Options for configuring the piping behavior.
 * @param {AbortSignal} [options.signal] AbortSignal to abort ongoing pipe operation.
 * @param {boolean} [options.preventCancel] Prevent the source from being canceled.
 * @param {boolean} [options.preventClose] Prevent the source from being closed.
 * @param {boolean} [options.preventAbort] Prevent the source from being aborted.
 * @returns {Promise<Uint8Array>} A promise that resolves to a `Uint8Array` containing all the bytes read from the stream.
 */
export async function readAll(
  stream: ReadableStream<Uint8Array>,
  options: PipeOptions = {},
): Promise<Uint8Array> {
  const chunks = await collect(stream, options);
  return concat(...chunks);
}
