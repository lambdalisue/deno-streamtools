import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";
import { push } from "./push.ts";

Deno.test("push", async (t) => {
  await t.step("returns the next item in the stream", async () => {
    const results: number[] = [];
    const stream = new WritableStream<number>({
      write(chunk) {
        results.push(chunk);
      },
    });
    await push(stream, 1);
    await push(stream, 2);
    await push(stream, 3);
    assertEquals(results, [1, 2, 3]);
  });
});
