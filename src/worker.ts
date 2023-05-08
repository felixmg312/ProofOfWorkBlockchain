import { miner } from "./miner";
import { parentPort, workerData } from "worker_threads";
(async function () {
      parentPort?.postMessage(`in worker.ts ${workerData}`)
      await miner.mine(workerData)
  })();
