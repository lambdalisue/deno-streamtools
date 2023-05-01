import { concat } from "https://deno.land/std@0.185.0/bytes/mod.ts";
import { collect } from "./collect.ts";

/**
 * Reads all available bytes from a given `ReadableStream<Uint8Array>` and concatenates them into a single `Uint8Array`.
 *
 * @param stream The stream to read from.
 * @returns A promise that resolves to a `Uint8Array` containing all the bytes read from the stream.
 */
export async function readAll(
  stream: ReadableStream<Uint8Array>,
): Promise<Uint8Array> {
  const chunks = await collect(stream);
  return concat(...chunks);
}
