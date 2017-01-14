# Node.js memory leak

It reproduces node.js memory leak.
The leak's reproduced on *Node.js 6.9.4* or *7.4.0*.
It's reproduced *Debian 8.6*, but **not** on *Windows 10*.

## Basic usage
```
npm install --only=prod
```
```
node --expose-gc test.js --no-snapshots
```
It infinitely repeats the code below and prints total allocated memory `process.memoryUsage().rss`:
```js
const engine = torrentStream(magnet, opts);
engine.on('ready', () => {
    engine.remove(() => {
        engine.destroy(() => {
            // repeat all again
        });
    });
});
```

## Usage with v8-profiler
```
npm install
```
```
node --expose-gc test.js
```
It's like basic usage, but additionally it writes snapshot files after each 10 iterations.