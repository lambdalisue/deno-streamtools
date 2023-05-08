import { channel as channelV3 } from "https://deno.land/x/streamtools@v0.3.0/channel.ts";
import { channel } from "./channel.ts";

Deno.bench("channel", { group: "channel", baseline: true }, async () => {
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

Deno.bench("channelV3", { group: "channel" }, async () => {
  const { reader, writer } = channelV3<number>();

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
