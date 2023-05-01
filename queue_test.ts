import {
  assertEquals,
  assertRejects,
  assertThrows,
} from "https://deno.land/std@0.185.0/testing/asserts.ts";
import {
  Queue,
  QueueClosedError,
  QueueDequeueLockedError,
  QueueEnqueueLockedError,
} from "./queue.ts";

Deno.test("Queue enqueue and dequeue", async () => {
  const q = new Queue<number>();

  assertEquals(q.size, 0);
  q.enqueue(1);
  assertEquals(q.size, 1);
  q.enqueue(2);
  assertEquals(q.size, 2);
  q.enqueue(3);
  assertEquals(q.size, 3);
  assertEquals(await q.dequeue(), 1);
  assertEquals(q.size, 2);
  assertEquals(await q.dequeue(), 2);
  assertEquals(q.size, 1);
  assertEquals(await q.dequeue(), 3);
  assertEquals(q.size, 0);
});

Deno.test("Queue closed", async () => {
  const q = new Queue<number>();

  q.close();

  await assertRejects(
    () => q.dequeue(),
    QueueClosedError,
  );
});

Deno.test("Queue readable", async () => {
  const q = new Queue<number>();
  const reader = q.readable.getReader();

  assertThrows(
    () => q.dequeue(),
    QueueDequeueLockedError,
  );

  q.enqueue(1);
  q.enqueue(2);
  q.enqueue(3);
  q.close();

  assertEquals(await reader.read(), { value: 1, done: false });
  assertEquals(await reader.read(), { value: 2, done: false });
  assertEquals(await reader.read(), { value: 3, done: false });
  assertEquals(await reader.read(), { value: undefined, done: true });
  reader.releaseLock();
});

Deno.test("Queue writable", async () => {
  const q = new Queue<number>();
  const writer = q.writable.getWriter();

  assertThrows(
    () => q.enqueue(1),
    QueueEnqueueLockedError,
  );

  writer.write(1);
  writer.write(2);
  writer.close();

  assertEquals(await q.dequeue(), 1);
  assertEquals(await q.dequeue(), 2);

  await assertRejects(
    () => q.dequeue(),
    QueueClosedError,
    "Queue is closed",
  );
});
