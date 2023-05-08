"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerManager = exports.importWorker = void 0;
const worker_threads_1 = require("worker_threads");
function importWorker(path, wData, options) {
    const resolvedPath = require.resolve(path);
    return new worker_threads_1.Worker(resolvedPath, Object.assign(Object.assign({}, options), { execArgv: /\.ts$/.test(resolvedPath) ? ["--require", "ts-node/register"] : undefined, workerData: wData, resourceLimits: {
            maxOldGenerationSizeMb: 2048,
            maxYoungGenerationSizeMb: 1024
        } }));
}
exports.importWorker = importWorker;
class WorkerManager {
    constructor(path) {
        this.worker = importWorker(path, null);
        this.worker.on('error', (err) => {
            console.log(err);
        });
        this.worker.on('message', (data) => {
            console.log(data);
        });
    }
    init(path, chainTip) {
        this.worker = importWorker(path, chainTip);
        this.worker.on('error', (err) => {
            console.log(err);
        });
        this.worker.on('message', (data) => {
            console.log(data);
        });
    }
}
exports.workerManager = new WorkerManager('./worker.ts');
