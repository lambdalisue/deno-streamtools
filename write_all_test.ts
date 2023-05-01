import { assertEquals } from "https://deno.land/std@0.185.0/testing/asserts.ts";
import { concat } from "https://deno.land/std@0.185.0/bytes/mod.ts";
import { writeAll } from "./write_all.ts";

Deno.test("writeAll", async () => {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const stream = new WritableStream({
    write(chunk) {
      chunks.push(chunk);
    },
  });
  await writeAll(stream, encoder.encode("HelloWorld"));
  assertEquals(concat(...chunks), encoder.encode("HelloWorld"));
});
