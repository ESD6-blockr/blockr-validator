import { SchedulableJob } from "app/jobs/abstractions/schedulableJob";

export class BlockJob extends SchedulableJob {
    private keyPair?: string;

    constructor() {
        super(() => {
            //FileUtils#fileExists(path + name)
            //FileUtils#

            //1x uitvoeren, niet in een loop
            
            //if fileExists --> getKeyPairFromFile & save in memory
            //!if fileExists --> generateKeyPair
            //                   write to file + create if inexistent
            //                   save in memory                      

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

        this.setOnInit(async () => {
            this.keyPair = await this.getOrGenerateKeyPairAsync();
        });
    }

    private async getOrGenerateKeyPairAsync(): Promise<string> {
        throw new Error("Not implemented.");
    }
}
