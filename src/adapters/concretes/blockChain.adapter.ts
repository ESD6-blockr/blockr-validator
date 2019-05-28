import { Block } from "@blockr/blockr-models";
import { Message, Peer } from "@blockr/blockr-p2p-lib";
import { PeerType } from "@blockr/blockr-p2p-lib/dist/enums";
import { injectable } from "inversify";
import { BaseAdapter } from "../abstractions/base.adapter";
import { MessageType } from "../enums/messageType.enum";
import { IBlockchainServiceAdapter } from "../interfaces/blockchain.adapter";

@injectable()
export class BlockchainAdapter extends BaseAdapter<IBlockchainServiceAdapter> {
    constructor(peer: Peer) {
        super(peer);
    }

    public shouldGenerateGenesisBlock(): boolean {
        return !this.peer.getPeerOfType(PeerType.VALIDATOR);
    }

    // TODO: Should implement onMessage for BLOCKCHAIN_REQUEST

    /**
     * Requests the blockchain from a random validator within the peer-to-peer network
     */
    public async requestBlockchainAsync(): Promise<Block[]> {
        return new Promise(async (resolve) => {
            const message = new Message(MessageType.BLOCKCHAIN_REQUEST);
            
            this.peer.sendMessageToRandomPeerAsync(message, PeerType.VALIDATOR, (responseMessage: Message) => {
                const blockchain: Block[] = JSON.parse(responseMessage.body as string);

                resolve(blockchain);
            });
            await this.peer.getPromiseForResponse(message);
        });
    }
}
