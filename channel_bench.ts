import { channel } from "./channel.ts";

Deno.bench("channel", async () => {
  const { reader, writer } = channel<number>();

  const producer = async () => {
    const w = writer.getWriter();
    for (let i = 0; i < 100000; i++) {
      await w.ready;
      await w.write(i);
    }
    w.releaseLock();
    await writer.close();
  };
  const consumer = async () => {
    for await (const _ of reader) {
      // Do NOTHING
    }
  };
  await Promise.all([producer(), consumer()]);
});
