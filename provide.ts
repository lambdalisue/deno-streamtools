/**
 * Provides the given values to the writable stream by piping them from a readable stream
 * created from the values. Returns a promise that resolves when all the values have been
 * successfully written to the stream.
 *
 * @param stream - The writable stream to write the values to.
 * @param values - An array of values to write to the stream.
 * @returns A promise that resolves when all values have been successfully written to the stream.
 */
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
