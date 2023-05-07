import { assertEquals } from "https://deno.land/std@0.186.0/testing/asserts.ts";
import { pop } from "./pop.ts";

Deno.test("pop", async (t) => {
  await t.step(
    "returns the next item in the stream or null if the stream is closed",
    async () => {
      const stream = new ReadableStream<number>({
        start(controller) {
          controller.enqueue(1);
          controller.enqueue(2);
          controller.enqueue(3);
          controller.close();
        },
      });
      assertEquals(await pop(stream), 1);
      assertEquals(await pop(stream), 2);
      assertEquals(await pop(stream), 3);
      assertEquals(await pop(stream), null);
    },
  );
});
