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
exports.miner = exports.Miner = void 0;
const object_1 = require("./object");
const network_1 = require("./network");
const json_canonicalize_1 = require("json-canonicalize");
const fs_1 = require("fs");
const mempool_1 = require("./mempool");
const worker_threads_1 = require("worker_threads");
const path_1 = require("path");
const transaction_1 = require("./transaction");
const block_1 = require("./block");
const TARGET = '00000000abc00000000000000000000000000000000000000000000000000000';
const GENESIS = {
    T: TARGET,
    created: 1671062400,
    miner: 'Marabu',
    nonce: '000000000000000000000000000000000000000000000000000000021bea03ed',
    note: 'The New York Times 2022-12-13: Scientists Achieve Nuclear Fusion Breakthrough With Blast of 192 Lasers',
    previd: null,
    txids: [],
    type: 'block'
};
const PK1 = 'f34cb14626372b97121625606173e94a58f641a1ce38022656c72845efa51dad';
//TODO
class Miner {
    constructor(sid) {
        this.studentid = sid;
        //let txs = mempool.getTxIds()
        let currentUNIXtimestamp = Math.floor(new Date().getTime() / 1000);
        this.newBlock = new block_1.Block(null, [], '0000000000000000000000000000000000000000000000000000000000000000', TARGET, currentUNIXtimestamp, ':)', 'plz work', sid);
    }
    syncWriteFile(data) {
        (0, fs_1.writeFileSync)((0, path_1.join)(__dirname, 'mineLog.txt'), data, {
            flag: 'a+',
        });
    }
    mine(workerData) {
        return __awaiter(this, void 0, void 0, function* () {
            let chainTip = workerData;
            if (chainTip !== null) {
                let counter = 0;
                while (true) {
                    console.log("mining");
                    let txs = mempool_1.mempool.getTxIds();
                    let currentUNIXtimestamp = Math.floor(new Date().getTime() / 1000);
                    this.newBlock.previd = chainTip.blockid;
                    this.newBlock.created = currentUNIXtimestamp;
                    this.newBlock.txids = txs;
                    this.newBlock.height = chainTip.height + 1;
                    let coinbase = {
                        height: this.newBlock.height,
                        outputs: [{
                                pubkey: PK1,
                                value: 50000000000
                            }],
                        type: "transaction"
                    };
                    let tx = transaction_1.Transaction.fromNetworkObject(coinbase);
                    this.newBlock.txids.unshift(tx.txid);
                    this.newBlock.updateNounce();
                    if (counter % 10000 === 0) {
                        worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(`trying block ${(0, json_canonicalize_1.canonicalize)(this.newBlock.toNetworkObject())}`);
                    }
                    if (this.newBlock.hasPoW()) {
                        //create coinbase 
                        worker_threads_1.parentPort.postMessage(`mined a new block ${this.newBlock.blockid}`);
                        this.syncWriteFile(`succesfully mined block ${this.newBlock.toNetworkObject()}`);
                        yield object_1.objectManager.put(coinbase);
                        for (let peer of network_1.network.peers) {
                            yield peer.sendIHaveObject(coinbase);
                            yield peer.sendObject(coinbase);
                        }
                        for (let peer of network_1.network.peers) {
                            yield peer.sendObject(this.newBlock.toNetworkObject());
                        }
                        this.newBlock.nonce = '0000000000000000000000000000000000000000000000000000000000000000';
                        //return this.newBlock
                    }
                    counter += 1;
                }
            }
        });
    }
}
exports.Miner = Miner;
exports.miner = new Miner(['ouyang42', 'felixmg']);
//SK: a7e9047310e1fb0bcb91e4dba7105eb2812a99484672a8f7ee9ca271254b1df6
//----------------------------------------
//PK: f34cb14626372b97121625606173e94a58f641a1ce38022656c72845efa51dad
