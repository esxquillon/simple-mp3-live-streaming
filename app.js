const fs = require('fs');
const path = require('path');

const Hapi = require('@hapi/hapi');
const StaticFilePlugin = require('@hapi/inert');

const CQueue = require('./Classes/Queue.class');
const CRoutes = require('./Classes/Routes.class');

// Initialize Class Queue
const cQueue = new CQueue();

// Create a server using hapi
void async function startServer() {
    try {
        const server = Hapi.server({
            port: process.env.PORT || 5001,
            host: process.env.HOST || '0.0.0.0',
            compression: false,
            routes: {
                files: { relativeTo: path.join(__dirname, 'public') }
            }
        });
        await server.register(StaticFilePlugin);
        await server.register(new CRoutes(cQueue));

        await server.start();
        console.log(`Server running at: ${server.info.uri}`);
    }
    catch (err) {
        console.log(`Server errored with: ${err}`);
        console.error(err.stack);
        process.exit(1);
    }
}();

/**
 * Load file and stream to all sinks.
 */

// Serve mp3 file in 3 seconds
setTimeout(async function playMusic() {
    const song = __dirname + '/mp3/test.mp3';

    // Stream reading
    const songReadable = fs.createReadStream(song);

    // Setup transform
    const bitRate = await cQueue.getBitRate(song);
    const throttleTransformable = cQueue.transform(bitRate);

    // Playing loop
    throttleTransformable.on('end', () => playMusic());

    // Pipe Stream
    songReadable.pipe(throttleTransformable);
}, 5000);