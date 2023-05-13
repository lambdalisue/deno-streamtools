# streamtools

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/streamtools)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/streamtools/mod.ts)
[![Test](https://github.com/lambdalisue/deno-streamtools/workflows/Test/badge.svg)](https://github.com/lambdalisue/deno-streamtools/actions?query=workflow%3ATest)

This is a [Deno][deno] module that provides utilities for handling Streams API.

[deno]: https://deno.land/

## Usage

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
import { assertEquals } from "https://deno.land/std@0.186.0/testing/asserts.ts";
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
import { assertEquals } from "https://deno.land/std@0.186.0/testing/asserts.ts";
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
