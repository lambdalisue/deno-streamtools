import { assertEquals } from "https://deno.land/std@0.186.0/testing/asserts.ts";
import { promiseState } from "https://deno.land/x/async@v2.0.2/mod.ts";
import { provide } from "./provide.ts";
import { collect } from "./collect.ts";
import { push } from "./push.ts";
import { pop } from "./pop.ts";
import { boundedChannel } from "./bounded_channel.ts";

Deno.test("boundedChannel", async (t) => {
  await t.step(
    "returns a readable stream and a writable stream that are connected to each other",
    async () => {
      const { reader, writer } = boundedChannel<number>(5);
      await provide(writer, [1, 2, 3]);
      assertEquals(await collect(reader), [1, 2, 3]);
    },
  );

  await t.step(
    "the writer waits until the number of items in the channel become less than the capacity",
    async () => {
      const { reader, writer } = boundedChannel<number>(5);
      await provide(writer, [1, 2, 3, 4, 5], { preventClose: true });
      const pushPromise = push(writer, 6);
      assertEquals(await promiseState(pushPromise), "pending");
      assertEquals(await pop(reader), 1);
      assertEquals(await promiseState(pushPromise), "fulfilled");
      writer.close();
      assertEquals(await collect(reader), [2, 3, 4, 5, 6]);
    },
  );
});
