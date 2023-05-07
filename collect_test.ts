import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.186.0/testing/asserts.ts";
import {
  deadline,
  DeadlineError,
} from "https://deno.land/std@0.186.0/async/deadline.ts";
import { collect } from "./collect.ts";

Deno.test("collect returns an empty array for an empty stream", async () => {
  const stream = new ReadableStream<string>({
    start(controller) {
      controller.close();
    },
  });
  const result = await collect(stream);
  assertEquals(result, []);
});

Deno.test("collect returns all chunks in order for a non-empty stream", async () => {
  const chunks = ["a", "b", "c"];
  const stream = new ReadableStream<string>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));
      controller.close();
    },
  });
  const result = await collect(stream);
  assertEquals(result, chunks);
});

Deno.test("collect throws an error when the stream emits an error", async () => {
  const error = new Error("test error");
  const stream = new ReadableStream<string>({
    start(controller) {
      controller.error(error);
    },
  });
  await assertRejects(
    () => collect(stream),
  );
});

Deno.test("collect waits forever when the stream is not closed", async () => {
  const stream = new ReadableStream<string>();
  await assertRejects(
    () => deadline(collect(stream), 100),
    DeadlineError,
  );
});
