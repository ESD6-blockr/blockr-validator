import { logger } from "@blockr/blockr-logger";
import { Block, State } from "@blockr/blockr-models";
import { Message, Peer, PeerType } from "@blockr/blockr-p2p-lib";
import { RESPONSE_TYPE } from "@blockr/blockr-p2p-lib/dist/interfaces/peer";
import { inject, injectable } from "inversify";
import { BaseAdapter } from "../abstractions/base.adapter";
import { P2PMessageSendingHandler } from "../communication/handlers/concretes/p2pMessageSending.handler";
import { P2POnMessageHandler } from "../communication/handlers/concretes/p2pOnMessage.handler";
import { IMessageSendingHandler } from "../communication/handlers/interfaces/messageSending.handler";
import { IOnMessageHandler } from "../communication/handlers/interfaces/onMessage.handler";
import { P2PCommunicationRepository } from "../communication/repositories/concretes/p2pCommunication.repository";
import { MessageType } from "../enums/messageType.enum";
import { IBlockchainServiceAdapter } from "../interfaces/blockchainService.adapter";

@injectable()
export class BlockchainAdapter extends BaseAdapter<IBlockchainServiceAdapter> {
    constructor(@inject(Peer) peer: Peer) {
        super(new P2PCommunicationRepository(peer));
    }

    public shouldGenerateGenesisBlock(): boolean {
        return (this.communicationRepository as P2PCommunicationRepository)
                    .getPeerOfType(PeerType.VALIDATOR) === undefined;
    }

    /**
     * Requests the blockchain and the states from a random validator within the peer-to-peer network
     */
    public async requestBlockchainAndStatesAsync(): Promise<[Block[], State[]]> {
        return new Promise(async (resolve, reject) => {
            try {
                logger.info("[BlockchainAdapter] Requesting blockchain and states.");

                const message = new Message(MessageType.BLOCKCHAIN_AND_STATES_REQUEST);
                const handler: IMessageSendingHandler = new P2PMessageSendingHandler(
                    message,
                    PeerType.VALIDATOR,
                    (responseMessage: Message) => {
                        logger.info("[BlockchainAdapter] Received blockchain and states.");
                        const blockchainAndStates: [Block[], State[]] = JSON.parse(responseMessage.body as string);
                        
                        resolve(blockchainAndStates);
                    },
                );

                this.communicationRepository.sendMessageToRandomNodeAsync!(handler);
                await (this.communicationRepository as P2PCommunicationRepository).getPromiseForResponse(message);
            } catch (error) {
                reject(error);
            }
        });
    }

    protected initOnMessageHandlers(): void {
        const blockchainAndStatesRequestHandler: IOnMessageHandler = new P2POnMessageHandler(
            MessageType.BLOCKCHAIN_AND_STATES_REQUEST,
            async (message: Message, senderGuid: string, response: RESPONSE_TYPE) => {
                await this.handleBlockchainRequest(message, senderGuid, response).catch((error) => logger.error(error));
            },
        );

        this.communicationRepository.addOnMessageHandler(blockchainAndStatesRequestHandler);
    }

    private handleBlockchainRequest(_message: Message, _senderGuid: string, response: RESPONSE_TYPE): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const blockchain = await this.getServiceAdapter().getBlockchainAsync();
                const states = await this.getServiceAdapter().getStatesAsync();
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
