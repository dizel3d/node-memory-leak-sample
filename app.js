var url = require('url'),
    express = require('express'),
    torrentStream = require('torrent-stream');

var app = express();
var reloads = 0;

var opts = {
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
}

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get('/', function (req, res) {
    var urlObj = url.parse(req.url, true),
        query = urlObj.query;

    if (query.magnet !== undefined && query.title !== undefined && query.magnet !== 'undefined' && query.title !== 'undefined') {
        var engine = torrentStream('magnet:?xt=urn:btih:' + query.magnet, opts);
        engine.on('ready', function() {
            engine.remove(function() {
                engine.destroy(function() {
                    res.end(`
						<html>
							<body>
								<div>${++reloads}</div>
								<script>location.reload.bind(location, true)</script>
							</body>
						</html>
					`);
                    global.gc();
                });
            });
        });
    } else {
        res.end('invalid dl parameters');
    }
});

app.listen(3000);
