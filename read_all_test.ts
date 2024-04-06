import { assertEquals } from "@std/assert";
import { readAll } from "./read_all.ts";

Deno.test("readAll", async () => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("Hello"));
      controller.enqueue(encoder.encode("World"));
      controller.close();
    },
  });
  const result = await readAll(stream);
  assertEquals(result, encoder.encode("HelloWorld"));
});
