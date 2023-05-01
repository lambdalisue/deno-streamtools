/**
 * Write all data from a Uint8Array to a writable stream.
 *
 * @param stream The stream to write to.
 * @param data The data to write.
 * @returns A promise that resolves when all the data has been written to the stream.
 */
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
