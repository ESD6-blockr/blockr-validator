import { ScheduledJob } from "app/jobs/abstractions/scheduledJob";

export class BlockJob extends ScheduledJob {
    constructor() {
        super(() => {
            // this.keyStorage.getKeypairAsync().then((resultKeyPair) => {
            //     Database.getBlockchainAsync().then((resultBlock) => {
            //       const lastBlock = resultBlock[resultBlock.length - 1];
            //       let lasthash = lastBlock.blockHeader.blockHash;
            //       if (!lasthash) lasthash = '';
            //       this.blockTask.createAndSend(resultKeyPair.pubKey, lasthash, TemporaryStorage.getPendingTransactionsAsArray(), lastBlock.blockHeader.blockNumber + 1);
            //       Database.getGlobalStateAsync().then((globalState) => {
            //         this.lotteryTask.scheduleTask(lasthash, globalState);
            //       });
            //     });
            //   });
        });
    }
}
