
module.exports = class CRoutes {
    name = 'streamServer';

    constructor(cQueue) {
        this.cQueue = cQueue;
    }

    async register(server) {

        // Serving the index.html
        server.route({
            method: 'GET',
            path: '/',
            handler: (_, h) => h.file('index.html')
        });

        // Streaming entry
        server.route({
            method: 'GET',
            path: '/stream',
            handler: (request, h) => {
                // Add a new sink into the current session.
                const { id, responseSink } = this.cQueue.createSink();

                console.log('Connected', id);

                request.app.sinkId = id;
                return h.response(responseSink).type('audio/mpeg');
            },
            options: {
                ext: {
                    onPreResponse: {
                        method: (request, h) => {
                            // Remove the sink id from the disconnected session.
                            request.events.once('disconnect', () => {

                                console.log('Disconnected', request.app.sinkId);
                                
                                this.cQueue.removeSink(request.app.sinkId);
                            });
                            return h.continue;
                        }
                    }
                }
            }
        });

    }
}