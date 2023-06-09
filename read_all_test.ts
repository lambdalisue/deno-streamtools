import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";
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
