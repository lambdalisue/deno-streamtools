export async function writeAll(
  stream: WritableStream<Uint8Array>,
  data: Uint8Array,
): Promise<void> {
  const input = new ReadableStream({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    },
  });
  await input.pipeTo(stream);
}
