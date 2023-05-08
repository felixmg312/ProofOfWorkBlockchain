"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.miner = void 0;
const chain_1 = require("./chain");
const hash_1 = require("./crypto/hash");
// import { Worker, WorkerOptions } from "worker_threads";
const json_canonicalize_1 = require("json-canonicalize");
const mempool_1 = require("./mempool");
const network_1 = require("./network");
class Miner {
    constructor() {
        this.TARGET = '00000000abc00000000000000000000000000000000000000000000000000000';
        let Latest_Block = {
            T: this.TARGET,
            created: Math.floor(Date.now()) / 1000,
            miner: 'OK miner',
            nonce: '0000000000000000000000000000000000000000000000000000000000000000',
            note: 'please no fork',
            previd: null,
            txids: [],
            studentids: ['felixmg', 'ouyang42'],
            type: 'block'
        };
        this.sk = "a7e9047310e1fb0bcb91e4dba7105eb2812a99484672a8f7ee9ca271254b1df6";
        this.pk = "f34cb14626372b97121625606173e94a58f641a1ce38022656c72845efa51dad";
        this.latest_block = Latest_Block;
        this.coinbase_tx = {
            "type": "transaction",
            "height": 0,
            "outputs": [
                {
                    "pubkey": this.pk,
                    "value": 50000000000
                }
            ]
        };
    }
    init() {
        this.mine();
    }
    construct_block(nonce) {
        return __awaiter(this, void 0, void 0, function* () {
            let all_tx = mempool_1.mempool.getTxIds();
            let prev_block = chain_1.chainManager.longestChainTip;
            // console.log(this.coinbase_tx)
            // this.coinbase_tx.height = chainManager.longestChainHeight+1;
            this.coinbase_tx = {
                "type": "transaction",
                "height": chain_1.chainManager.longestChainHeight + 1,
                "outputs": [
                    {
                        "pubkey": this.pk,
                        "value": 50000000000
                    }
                ]
            };
            console.log(this.coinbase_tx.height);
            this.coinbase_tx.height = chain_1.chainManager.longestChainHeight + 1;
            this.latest_block.txids = all_tx;
            this.latest_block.created = Math.floor(Date.now()) / 1000;
            this.latest_block.nonce = nonce;
            this.latest_block.previd = prev_block.blockid;
            this.latest_block.txids = [(0, hash_1.hash)((0, json_canonicalize_1.canonicalize)(this.coinbase_tx)), ...this.latest_block.txids];
        });
    }
    // let all_tx= async mempool.load();
    number2string(nonce) {
        let nonce_str = nonce.toString(16);
        nonce_str = nonce_str.padStart(32, '0');
        // console.log(nonce_str)
        return nonce_str;
    }
    string2number(nonce) {
        let nonce_int = parseInt(nonce, 16);
        // console.log(nonce_int)
        return nonce_int;
    }
    mine() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("start minining");
            // const worker= new Worker("./worker-thread.ts")
            let nonce_int = 0;
            let nonce_str = this.number2string(nonce_int);
            while (true) {
                let newest_block = this.construct_block(nonce_str);
                let difficulty = this.string2number(this.TARGET);
                console.log(nonce_int);
                if (this.string2number((0, hash_1.hash)((0, json_canonicalize_1.canonicalize)(newest_block))) <= difficulty) {
                    network_1.network.broadcast(newest_block);
                    network_1.network.broadcast(this.coinbase_tx);
                    nonce_int = 0;
                    break;
                }
                nonce_int += 1;
                nonce_str = this.number2string(nonce_int);
            }
        });
    }
    mine_block() {
        return __awaiter(this, void 0, void 0, function* () {
            // const worker= new Worker("./worker-thread.ts")
            console.log("start minining");
            let nonce_int = 0;
            let nonce_str = this.number2string(nonce_int);
            while (true) {
                let newest_block = this.construct_block(nonce_str);
                let difficulty = this.string2number(this.TARGET);
                console.log(nonce_int);
                // const worker = new Worker("./worker-thread.ts");
                if (this.string2number((0, hash_1.hash)((0, json_canonicalize_1.canonicalize)(newest_block))) <= difficulty) {
                    return newest_block;
                }
                nonce_int += 1;
                nonce_str = this.number2string(nonce_int);
            }
        });
    }
}
// const miner_test = new Miner();
// (async function () {
//   let b = await miner_test.mine()
//   parentPort!.postMessage('hello')
// })();
exports.miner = new Miner();
