import { assertEquals } from "https://deno.land/std@0.186.0/testing/asserts.ts";
import { provide } from "./provide.ts";
import { collect } from "./collect.ts";
import { channel } from "./channel.ts";

Deno.test("channel", async (t) => {
  await t.step(
    "returns a readable stream and a writable stream that are connected to each other",
    async () => {
      const { reader, writer } = channel<number>();
      await provide(writer, [1, 2, 3]);
      assertEquals(await collect(reader), [1, 2, 3]);
    },
  );
});
