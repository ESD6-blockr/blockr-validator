import { logger } from "@blockr/blockr-logger";
import { Block, State } from "@blockr/blockr-models";
import { Message, Peer } from "@blockr/blockr-p2p-lib";
import { PeerType } from "@blockr/blockr-p2p-lib/dist/enums";
import { RESPONSE_TYPE } from "@blockr/blockr-p2p-lib/dist/interfaces/peer";
import { inject, injectable } from "inversify";
import { BaseAdapter } from "../abstractions/base.adapter";
import { MessageType } from "../enums/messageType.enum";
import { IBlockchainServiceAdapter } from "../interfaces/blockchain.adapter";

@injectable()
export class BlockchainAdapter extends BaseAdapter<IBlockchainServiceAdapter> {
    constructor(@inject(Peer) peer: Peer) {
        super(peer);
    }

    public shouldGenerateGenesisBlock(): boolean {
        return !this.peer.getPeerOfType(PeerType.VALIDATOR);
    }

    /**
     * Requests the blockchain and the states from a random validator within the peer-to-peer network
     */
    public async requestBlockchainAndStatesAsync(): Promise<[Block[], State[]]> {
        return new Promise(async (resolve, reject) => {
            try {
                const message = new Message(MessageType.BLOCKCHAIN_AND_STATES_REQUEST);
            
                this.peer.sendMessageToRandomPeerAsync(message, PeerType.VALIDATOR, (responseMessage: Message) => {
                    const blockchainAndStates: [Block[], State[]] = JSON.parse(responseMessage.body as string);
                    
                    resolve(blockchainAndStates);
                });
                await this.peer.getPromiseForResponse(message);
            } catch (error) {
                reject(error);
            }
        });
    }

    protected initReceiveHandlers(): void {
        this.peer.registerReceiveHandlerForMessageType(MessageType.BLOCKCHAIN_AND_STATES_REQUEST,
                async (message: Message, senderGuid: string, response: RESPONSE_TYPE) => {
            await this.handleBlockchainRequest(message, senderGuid, response).catch((error) => logger.error(error));
        });
    }

    private handleBlockchainRequest(_message: Message, _senderGuid: string, response: RESPONSE_TYPE): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const blockchain = await this.getAdapter().getBlockchainAsync();
                const states = await this.getAdapter().getStatesAsync();
                const blockchainAndStates: [Block[], State[]] = [blockchain, states];

                resolve(response(new Message(
                        MessageType.BLOCKCHAIN_AND_STATES_REQUEST_RESPONSE,
                        JSON.stringify(blockchainAndStates),
                    ),
                ));
            } catch (error) {
                reject(error);
            }
        });
    }
}
