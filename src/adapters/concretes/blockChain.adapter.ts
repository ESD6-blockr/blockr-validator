import { IBlockChainAdapter } from "../interfaces/blockChain.adapter";
import { Peer, Message } from "@blockr/blockr-p2p-lib";
import { inject } from "inversify";
import { RESPONSE_TYPE } from "@blockr/blockr-p2p-lib/dist/interfaces/peer";

export class BlocksAdapter {

    private readonly peer: Peer;
    private readonly blockChain: IBlocksAdapter;

    public constructor(@inject(Peer) peer: Peer, blockChain: IBlocksAdapter) {
        this.peer = peer;
        this.blockChain = blockChain;
        this.initilizeMessageHandles();
    }

    public sendProposedBlock(){
        this.peer.sendMessageAsync();
    }
 

    private initilizeMessageHandles(): void {
        this.peer.registerReceiveHandlerForMessageType("proposedblock", async (message: Message, senderGuid: string, response: RESPONSE_TYPE) => { 
                                                        await this.handleProposedblock(message, senderGuid, response)} );

    }

    private handleProposedblock(message: Message, senderGuid: string, response: RESPONSE_TYPE): Promise<void>{
        this.blockChain.validateAsync(message);

    }


    this.peer.addbroadcastMessageHandler('proposedblock', (message) => {
        this.blockValidator.validateAsync(message.data).then(() => {
          this.blockValidator.validateTransactionsAsync(message.data).then(() => {
            TemporaryStorage.addProposedBlock(message.data);
          }, (err) => {
            console.log(err);
          });
        }, (err) => {
          console.log(err);
        });
      });
        
}