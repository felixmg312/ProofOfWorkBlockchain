import { logger } from './logger'
import { network } from './network'
import { chainManager } from './chain'
import { mempool } from './mempool'
import { AnnotatedError } from './message'
import { importWorker, workerManager } from './workerInit'
import { miner } from './miner'
import { parentPort } from 'worker_threads'
const BIND_PORT = 18018
const BIND_IP = '0.0.0.0'

logger.info(`Malibu - A Marabu node`)
logger.info(`liwen`)

const SegfaultHandler = require('segfault-handler')
SegfaultHandler.registerHandler('crash.log')

async function main() {
  await chainManager.init()
  await mempool.init()
  network.init(BIND_PORT, BIND_IP)
  console.log(`chaintip in main ${chainManager.longestChainTip?.height}`)
  let txToInclude = await mempool.findTxSigned('3f0bc71a375b574e4bda3ddf502fe1afd99aa020bf6049adfe525d9ad18ff33f')
  workerManager.init('./worker.ts',chainManager.longestChainTip,txToInclude)
}
main()

