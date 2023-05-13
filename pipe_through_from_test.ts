import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";
import { collect } from "./collect.ts";
import { channel } from "./channel.ts";
import { pipeThroughFrom } from "./pipe_through_from.ts";

Deno.test("pipeThroughFrom", async (t) => {
  await t.step(
    "returns a writable stream that pipe through to the specified writable stream",
    async () => {
      const encoder = new TextEncoder();
      const output = channel<string>();
      const stream = pipeThroughFrom(output.writer, new TextDecoderStream());
      const writer = stream.getWriter();
      await writer.write(encoder.encode("Hello"));
      await writer.write(encoder.encode("World"));
      await writer.close();
      writer.releaseLock();
      const result = await collect(output.reader);
      assertEquals(result, ["Hello", "World"]);
    },
  );
});
