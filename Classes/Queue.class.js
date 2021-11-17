const { v4: uuidv4 } = require('uuid');
const Throttle = require('throttle');
const { PassThrough } = require('stream');
const { ffprobe } = require('@dropb/ffprobe');

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

    // remove the sink handler
    removeSink(id) {
        this._sinks.delete(id);
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
        const throttleTransformable = new Throttle(bitRate / 8);

        // Do the broadcast to all sinks
        throttleTransformable.on('data', (chunk) => this.broadcast(chunk));

        return throttleTransformable;
    }

    // Get the bit rate of the current mp3
    async getBitRate(song) {
        try {
            const bitRate = (await ffprobe(song)).format.bit_rate;
            return parseInt(bitRate);
        }
        catch (err) {
            return 128000; // reasonable default
        }
    }
}