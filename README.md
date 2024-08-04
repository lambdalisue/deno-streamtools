> [!WARNING]
>
> **Deprecated**
> Use [`@core/streamutil`](https://jsr.io/@core/streamutil) instead.
>
> - https://github.com/jsr-core/streamutil

# streamtools

[![jsr](https://img.shields.io/jsr/v/%40lambdalisue/streamtools?logo=javascript&logoColor=white)](https://jsr.io/@lambdalisue/streamtools)
[![denoland](https://img.shields.io/github/v/release/lambdalisue/deno-streamtools?logo=deno&label=denoland)](https://github.com/lambdalisue/deno-streamtools/releases)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/streamtools/mod.ts)
[![Test](https://github.com/lambdalisue/deno-streamtools/workflows/Test/badge.svg)](https://github.com/lambdalisue/deno-streamtools/actions?query=workflow%3ATest)

This is a TypeScript module that provides utilities for handling Streams API.

## Usage

### pipeThroughFrom

Pipes the readable side of a `TransformStream` to a `WritableStream`. Returns
the writable side of the `TransformStream` for further piping.

```ts
import { channel } from "./channel.ts";
import { collect } from "./collect.ts";
import { pipeThroughFrom } from "./pipe_through_from.ts";

const encoder = new TextEncoder();
const output = channel<string>();
const stream = pipeThroughFrom(output.writer, new TextDecoderStream());
const writer = stream.getWriter();

await writer.write(encoder.encode("Hello"));
await writer.write(encoder.encode("World"));
await writer.close();
writer.releaseLock();

const result = await collect(output.reader);
console.log(result); // ["Hello", "World"]
```

### channel

`channel` creates a new channel, which is a pair of a readable and writable
stream.

```ts
import { channel } from "./channel.ts";
import { push } from "./push.ts";
import { pop } from "./pop.ts";

const { reader, writer } = channel<number>();

await push(writer, 1);
await push(writer, 2);
await push(writer, 3);
console.log(await pop(reader)); // 1
console.log(await pop(reader)); // 2
console.log(await pop(reader)); // 3
```

### collect/provide

`collect` reads all chunks from a readable stream and returns them as an array
of chunks.

```ts
import { collect } from "./collect.ts";

const reader = new ReadableStream<number>({
  start(controller) {
    controller.enqueue(1);
    controller.enqueue(2);
    controller.enqueue(3);
    controller.close();
  },
});

console.log(await collect(reader)); // [1, 2, 3]
```

`provide` provides the given values to the writable stream by piping them from a
readable stream created from the values. Returns a promise that resolves when
all the values have been successfully written to the stream.

```ts
import { provide } from "./provide.ts";

const results: number[] = [];
const writer = new WritableStream<number>({
  write(chunk) {
    results.push(chunk);
  },
});

await provide(writer, [1, 2, 3]);
console.log(results); // [1, 2, 3]
```

### pop/push

`pop` reads the next chunk from a readable stream.

```ts
import { pop } from "./pop.ts";

const reader = new ReadableStream<number>({
  start(controller) {
    controller.enqueue(1);
    controller.enqueue(2);
    controller.enqueue(3);
    controller.close();
  },
});

console.log(await pop(reader)); // 1
console.log(await pop(reader)); // 2
console.log(await pop(reader)); // 3
console.log(await pop(reader)); // null
```

`push` writes a chunk to a writable stream.

```ts
import { push } from "./push.ts";

const results: number[] = [];
const writer = new WritableStream<number>({
  write(chunk) {
    results.push(chunk);
  },
});

await push(writer, 1);
await push(writer, 2);
await push(writer, 3);
console.log(results); // [1, 2, 3]
```

### readAll/writeAll

`readAll` reads all available bytes from a given `ReadableStream<Uint8Array>`
and concatenates them into a single `Uint8Array`.

```ts
import { assertEquals } from "jsr:@std/assert";
import { readAll } from "./read_all.ts";

const encoder = new TextEncoder();
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue(encoder.encode("Hello"));
    controller.enqueue(encoder.encode("World"));
    controller.close();
  },
});
const result = await readAll(stream);
assertEquals(result, encoder.encode("HelloWorld"));
```

`writeAll` writes all data in a Uint8Array to a writable stream in chunk-size
units.

```ts
import { assertEquals } from "jsr:@std/assert";
import { writeAll } from "./write_all.ts";

const encoder = new TextEncoder();
const chunks: Uint8Array[] = [];
const stream = new WritableStream({
  write(chunk) {
    chunks.push(chunk);
  },
});
await writeAll(stream, encoder.encode("HelloWorld"), { chunkSize: 3 });
assertEquals(chunks, [
  encoder.encode("Hel"),
  encoder.encode("loW"),
  encoder.encode("orl"),
  encoder.encode("d"),
]);
```

## License

The code is released under the MIT license, which is included in the
[LICENSE](./LICENSE) file. By contributing to this repository, contributors
agree to follow the license for any modifications made.
