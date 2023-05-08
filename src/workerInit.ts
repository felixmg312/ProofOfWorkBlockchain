import { Worker,workerData,WorkerOptions } from 'worker_threads'
import { network } from './network';

export function importWorker(path: string, wData:any ,options?: WorkerOptions) {
    const resolvedPath = require.resolve(path);
    return new Worker(resolvedPath, {
      ...options,
      execArgv: /\.ts$/.test(resolvedPath) ? ["--require", "ts-node/register"] : undefined,
    workerData: wData,
    resourceLimits:{
        maxOldGenerationSizeMb:2048,
        maxYoungGenerationSizeMb:1024
    }
});
  }

class WorkerManager{
    worker: Worker
    constructor(path:string){
        this.worker = importWorker(path,null)
        this.worker.on('error',(err) => {
            console.log(err)
        })
        this.worker.on('message', (data) =>{
            console.log(data)
        })
    }
    init(path:string,chainTip:any){
        this.worker = importWorker(path,chainTip)
        this.worker.on('error',(err) => {
            console.log(err)
        })
        this.worker.on('message', async (data) =>{
            if (typeof data !== 'string'){
                let coinbase = data[0]
                let newBlock = data[1]
                for (let peer of network.peers){
                    await peer.sendObject(coinbase)
                }
                for (let peer of network.peers){
                    await peer.sendObject(newBlock)
                }
            }
            else{
                console.log(data)
            }
        })
    }
}
export const workerManager = new WorkerManager('./worker.ts')