
import { BlockObjectType, TransactionObjectType } from "./message"
import { canonicalize } from "json-canonicalize"
import { mempool } from "./mempool";
import { isMainThread, parentPort, workerData } from "worker_threads";
import { join } from "path"
import { Transaction } from "./transaction"
import { delay } from "./promise";
import { Block } from "./block";
const TARGET = '00000000abc00000000000000000000000000000000000000000000000000000'

const GENESIS: BlockObjectType = {
    T: TARGET,
    created: 1671062400,
    miner: 'Marabu',
    nonce: '000000000000000000000000000000000000000000000000000000021bea03ed',
    note: 'The New York Times 2022-12-13: Scientists Achieve Nuclear Fusion Breakthrough With Blast of 192 Lasers',
    previd: null,
    txids: [],
    type: 'block'
  }
const PK1 = 'f34cb14626372b97121625606173e94a58f641a1ce38022656c72845efa51dad'
const BU = 10**12
const BLOCK_REWARD = 50 * BU
export class Miner{
    studentid: []
    newBlock: any
    constructor(sid:any){
        this.studentid = sid
        //let txs = mempool.getTxIds()
        let currentUNIXtimestamp = Math.floor(new Date().getTime() / 1000)
        this.newBlock = new Block(
            null,
            [],
            '0000000000000000000000000000000000000000000000000000000000000000',
            TARGET,
            currentUNIXtimestamp,
            'desperate Miner :(',
            'plz work',
            sid
        )
    }

     async mine(workerData:any){
        parentPort?.postMessage(`in miner ${workerData}`)
        if (workerData !== null){
            let chainTip = workerData[0]
            let txToInclude = workerData[1]
            let counter = 0
            let currentUNIXtimestamp = Math.floor(new Date().getTime() / 1000)
            this.newBlock.previd = chainTip.blockid
            this.newBlock.created = currentUNIXtimestamp
            if (txToInclude !== 'null'){
                this.newBlock.txids.push(txToInclude)
            }
            this.newBlock.height = chainTip.height + 1
            let coinbase:TransactionObjectType  = {
                height: this.newBlock.height,
                outputs: [{
                    pubkey: PK1,
                    value: BLOCK_REWARD
                }],
                type: "transaction"
            }
            let tx = Transaction.fromNetworkObject(coinbase)
            this.newBlock.txids.unshift(tx.txid)
            while(true){
                this.newBlock.updateNounce()
                // if (counter % 1000000 === 0){
                //     parentPort?.postMessage(`coinbase tx: ${tx.txid}`)
                //     parentPort?.postMessage(`included tx: ${txToInclude}`)
                //     parentPort?.postMessage(`trying block ${canonicalize(this.newBlock.toNetworkObject())}`)
                // }
                if (this.newBlock.hasPoW()){
                    parentPort!.postMessage(`mined a new block ${this.newBlock.blockid}`)
                    parentPort?.postMessage([coinbase,this.newBlock.toNetworkObject()])
                    this.newBlock.nonce = '0000000000000000000000000000000000000000000000000000000000000000'
                    break
                    }
                // counter += 1
                }
        }
        }
    }

export const miner = new Miner(['ouyang42','felixmg'])

















//SK: a7e9047310e1fb0bcb91e4dba7105eb2812a99484672a8f7ee9ca271254b1df6
//----------------------------------------
//PK: f34cb14626372b97121625606173e94a58f641a1ce38022656c72845efa51dad