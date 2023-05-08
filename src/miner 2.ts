import { chainManager } from "./chain";
import { hash } from './crypto/hash';
import { parentPort, workerData } from 'worker_threads';

// import { Worker, WorkerOptions } from "worker_threads";
import { canonicalize } from 'json-canonicalize'
import { BlockObjectType, TransactionObjectType} from "./message";
import { mempool} from "./mempool";
import { network } from "./network";
class Miner{
    latest_block: BlockObjectType;
    coinbase_tx : TransactionObjectType;
    TARGET: string;
    private sk: string;
    private pk: string;
    
    constructor(){
        this.TARGET = '00000000abc00000000000000000000000000000000000000000000000000000'
        let Latest_Block: BlockObjectType = {
            T: this.TARGET,
            created:Math.floor(Date.now())/1000 ,
            miner: 'OK miner',
            nonce: '0000000000000000000000000000000000000000000000000000000000000000',
            note: 'please no fork',
            previd: null,
            txids: [],
            studentids: ['felixmg','ouyang42'],
            type: 'block'
            }
        this.sk="a7e9047310e1fb0bcb91e4dba7105eb2812a99484672a8f7ee9ca271254b1df6";
        this.pk="f34cb14626372b97121625606173e94a58f641a1ce38022656c72845efa51dad";
        this.latest_block = Latest_Block;
        this.coinbase_tx= {
            "type": "transaction",
            "height": 0,
            "outputs": [
              {
                "pubkey": this.pk,
                "value": 50000000000
              }
            ]
          }

    }

    init(){
        this.mine();
    }
    async construct_block(nonce: string){
        let all_tx= mempool.getTxIds();
        let prev_block= chainManager.longestChainTip;
        // console.log(this.coinbase_tx)
        // this.coinbase_tx.height = chainManager.longestChainHeight+1;
         this.coinbase_tx= {
            "type": "transaction",
            "height": chainManager.longestChainHeight+1,
            "outputs": [
              {
                "pubkey": this.pk,
                "value": 50000000000
              }
            ]
          }
        console.log(this.coinbase_tx.height);
        this.coinbase_tx.height=chainManager.longestChainHeight+1;
        this.latest_block.txids=all_tx;
        this.latest_block.created=Math.floor(Date.now())/1000;
        this.latest_block.nonce= nonce;
        this.latest_block.previd=prev_block!.blockid;
        
        this.latest_block.txids= [hash(canonicalize(this.coinbase_tx)),...this.latest_block.txids]
    }

    // let all_tx= async mempool.load();

    number2string(nonce: number){
        let nonce_str= nonce.toString(16)
        nonce_str=nonce_str.padStart(32,'0')
        // console.log(nonce_str)
        return nonce_str
    }

    string2number(nonce: string){
        let nonce_int= parseInt(nonce,16)
        // console.log(nonce_int)
        return nonce_int
    }
    async mine(){
        console.log("start minining")

        // const worker= new Worker("./worker-thread.ts")
        let nonce_int= 0;
        let nonce_str= this.number2string(nonce_int);

        while (true){

        let newest_block= this.construct_block(nonce_str)
        let difficulty= this.string2number(this.TARGET);

        console.log(nonce_int);
        if (this.string2number(hash(canonicalize(newest_block)))<= difficulty){
            network.broadcast(newest_block);
            network.broadcast(this.coinbase_tx);
            nonce_int=0;

            break;
            
        }
        nonce_int+=1;
        nonce_str= this.number2string(nonce_int);
        }
    }

    async mine_block(){
      // const worker= new Worker("./worker-thread.ts")
      console.log("start minining")
      let nonce_int= 0;
      let nonce_str= this.number2string(nonce_int);
      while (true){
      let newest_block= this.construct_block(nonce_str)
      let difficulty= this.string2number(this.TARGET);
      console.log(nonce_int);
      // const worker = new Worker("./worker-thread.ts");
      if (this.string2number(hash(canonicalize(newest_block)))<= difficulty){
          return newest_block;
          
      }
      nonce_int+=1;
      nonce_str= this.number2string(nonce_int);
      }
  }
}

// const miner_test = new Miner();
// (async function () {
//   let b = await miner_test.mine()
//   parentPort!.postMessage('hello')
// })();

export const miner = new Miner();



