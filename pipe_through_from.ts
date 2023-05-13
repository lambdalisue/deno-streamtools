/**
 * Pipes the readable side of a TransformStream to a WritableStream.
 * Returns the writable side of the TransformStream for further piping.
 *
 * ```ts
 * import { channel } from "./channel.ts";
 * import { collect } from "./collect.ts";
 * import { pipeThroughFrom } from "./pipe_through_from.ts";
 *
 * const encoder = new TextEncoder();
 * const output = channel<string>();
 * const stream = pipeThroughFrom(output.writer, new TextDecoderStream());
 * const writer = stream.getWriter();
 *
 * await writer.write(encoder.encode("Hello"));
 * await writer.write(encoder.encode("World"));
 * await writer.close();
 * writer.releaseLock();
 *
 * const result = await collect(output.reader);
 * console.log(result); // ["Hello", "World"]
 * ```
 *
 * @template I The type of data that the readable side of the TransformStream accepts.
 * @template O The type of data that the TransformStream transforms the input data into.
 * @param {WritableStream<O>} stream The destination WritableStream to pipe the data into.
 * @param {TransformStream<I, O>} transform The TransformStream that transforms the input data.
 * @returns {WritableStream<I>} The writable side of the TransformStream for further piping.
 */
export function pipeThroughFrom<I, O>(
  stream: WritableStream<O>,
  transform: TransformStream<I, O>,
): WritableStream<I> {
  transform.readable.pipeTo(stream);
  return transform.writable;
}
