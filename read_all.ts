import { concat } from "https://deno.land/std@0.185.0/bytes/mod.ts";
import { collect } from "./collect.ts";

export async function readAll(
  stream: ReadableStream<Uint8Array>,
): Promise<Uint8Array> {
  const chunks = await collect(stream);
  return concat(...chunks);
}
