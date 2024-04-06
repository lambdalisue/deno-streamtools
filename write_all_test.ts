import { assertEquals } from "@std/assert";
import { concat } from "@std/bytes";
import { writeAll } from "./write_all.ts";

Deno.test("writeAll", async (t) => {
  await t.step(
    "writes all data into the writer stream with chunks and closes it",
    async () => {
      const encoder = new TextEncoder();
      const chunks: Uint8Array[] = [];
      const stream = new WritableStream({
        write(chunk) {
          chunks.push(chunk);
        },
      });
      await writeAll(stream, encoder.encode("HelloWorld"), { chunkSize: 3 });
      assertEquals(concat(chunks), encoder.encode("HelloWorld"));
      assertEquals(chunks, [
        encoder.encode("Hel"),
        encoder.encode("loW"),
        encoder.encode("orl"),
        encoder.encode("d"),
      ]);
    },
  );
});
