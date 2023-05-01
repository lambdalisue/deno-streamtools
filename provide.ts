export async function provide<T>(
  stream: WritableStream<T>,
  values: T[],
): Promise<void> {
  const input = new ReadableStream({
    start(controller) {
      values.forEach((value) => controller.enqueue(value));
      controller.close();
    },
  });
  await input.pipeTo(stream);
}
