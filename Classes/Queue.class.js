const { v4: uuidv4 } = require('uuid');
const Throttle = require('throttle');
const { PassThrough } = require('stream');

// Class CQueue
module.exports = class CQueue {

    constructor() {
        this._sinks = new Map();
    }

    // Creating sink
    createSink() {
        const responseSink = PassThrough();
        const id = uuidv4();
        this._sinks.set(id, responseSink);
        return {
            id,
            responseSink
        };
    }

    // Broadcast the data to all sinks
    broadcast(chunk) {
        for (const [, sink] of this._sinks) {
            sink.write(chunk);
        }
    }

    // Transform the bitrate of the sound data
    transform(bitRate) {

        // I used 128k bitrate convertion to the sound data
        const throttleTransformable = new Throttle(128000 / 8);

        // Do the broadcast to all sinks
        throttleTransformable.on('data', (chunk) => this.broadcast(chunk));

        return throttleTransformable;
    }
}