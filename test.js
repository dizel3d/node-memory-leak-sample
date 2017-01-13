const torrentStream = require('torrent-stream');
const fs = require('fs');

const opts = {
    connections: 100,     // Max amount of peers to be connected to.
    uploads: 10,          // Number of upload slots.
    tmp: '/tmp',          // Root folder for the files storage.
                          // Defaults to '/tmp' or temp folder specific to your OS.
                          // Each torrent will be placed into a separate folder under /tmp/torrent-stream/{infoHash}
    path: '/tmp/my-file', // Where to save the files. Overrides `tmp`.
    verify: true,         // Verify previously stored data before starting
                          // Defaults to true
    dht: true,            // Whether or not to use DHT to initialize the swarm.
                          // Defaults to true
    tracker: true,        // Whether or not to use trackers from torrent file or magnet link
                          // Defaults to true
    trackers: [
        'udp://tracker.openbittorrent.com:80',
        'udp://tracker.ccc.de:80'
    ],
};

const magnet = 'magnet:?xt=urn:btih:040e6160ef43a8ae236ee4ef6766ea160d9bd39d';

let count = 0;

const runTorrent = callback => {
    global.gc();
    setTimeout(() => {
        console.log(`${count}: ${process.memoryUsage().rss / (1024 * 1024) | 0} MB`);
        const engine = torrentStream(magnet, opts);
        engine.on('ready', () => {
            engine.remove(() => {
                engine.destroy(() => {
                    callback(++count);
                });
            });
        });
    }, 1000);
};

const baseTest = process.argv[2] === '--no-snapshots' ? runTorrent : callback => {
    const profiler = require('v8-profiler');

    if (count % 10 === 0) {
        console.log('Taking snapshot...');
        const snapshot = profiler.takeSnapshot();
        snapshot.export((error, result) => {
            fs.writeFileSync(`snapshot-${count}.heapsnapshot`, result);
            snapshot.delete();
            runTorrent(callback);
        });
    } else {
        runTorrent(callback);
    }
};

const action = () => baseTest(action);
action();
