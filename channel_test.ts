import { assertEquals, assertRejects } from "@std/assert";
import { deadline, DeadlineError } from "@std/async";
import { provide } from "./provide.ts";
import { pop } from "./pop.ts";
import { push } from "./push.ts";
import { collect } from "./collect.ts";
import { channel } from "./channel.ts";

Deno.test("channel", async (t) => {
  await t.step(
    "pushing data to the writer makes it available to the reader",
    async () => {
      const { reader, writer } = channel<number>();
      await provide(writer, [1, 2, 3]);
      assertEquals(await collect(reader), [1, 2, 3]);
    },
  );

  await t.step(
    "the reader waits for the writer to push data",
    async () => {
      const { reader, writer } = channel<number>();
      const waiter = pop(reader);
      await assertRejects(() => deadline(waiter, 100), DeadlineError);
      await push(writer, 1);
      assertEquals(await deadline(waiter, 100), 1);
    },
  );

  await t.step(
    "the reader is canceled when the writer is closed",
    async () => {
      const { reader, writer } = channel<number>();
      const waiter = collect(reader);
      await assertRejects(() => deadline(waiter, 100), DeadlineError);
      await push(writer, 1);
      await assertRejects(() => deadline(waiter, 100), DeadlineError);
      writer.close();
      assertEquals(await deadline(waiter, 100), [1]);
    },
  );

  await t.step(
    "closing the writer with already canceled reader does not throw an error",
    () => {
      const { reader, writer } = channel<number>();
      reader.cancel();
      writer.close();
    },
  );
});
