/**
 * Reads all chunks from a readable stream and returns them as an array of chunks.
 *
 * @template T The type of the chunks to read.
 * @param {ReadableStream<T>} stream The readable stream to read chunks from.
 * @returns {Promise<T[]>} A promise that resolves with an array of all the chunks read from the stream.
 */
export async function collect<T>(stream: ReadableStream<T>): Promise<T[]> {
  const chunks: T[] = [];
  await stream.pipeTo(
    new WritableStream({
      write(chunk) {
        chunks.push(chunk);
      },
    }),
  );
  return chunks;
}
