const fs = require('fs');
const express = require("express");
const app = express();

const CQueue = require('./Classes/Queue.class');

// Configuration
const port = 5001;
const host = "192.168.100.23";

// Initialize Class Queue
const cQueue = new CQueue();

// Listen server
app.listen(port, host, () => {
    console.log("Server running at http://" + host + ":" + port + "/");
});

// Create entry point for streaming
app.get('/stream', (req, res) => {
    const { responseSink } = cQueue.createSink();
    
    res.writeHead(200, { "Content-Type": 'audio/mpeg' });
    responseSink.pipe(res);
});

// Serve Static Files
app.use(express.static(__dirname + '/public'));


/**
 * Load file and stream to all sinks.
 */

// Serve mp3 file in 3 seconds
setTimeout(() => {
    const song = __dirname + '/mp3/test.mp3';

    // Stream reading
    const songReadable = fs.createReadStream(song);

    // Setup transform
    const bitRate = cQueue.getBitRate(song);
    const throttleTransformable = cQueue.transform(bitRate);

    // Pipe Stream
    songReadable.pipe(throttleTransformable);
}, 3000);