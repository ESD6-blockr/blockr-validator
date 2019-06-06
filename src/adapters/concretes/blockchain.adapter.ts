import { logger } from "@blockr/blockr-logger";
import { Block, State } from "@blockr/blockr-models";
import { Message, PeerType } from "@blockr/blockr-p2p-lib";
import { RESPONSE_TYPE } from "@blockr/blockr-p2p-lib/dist/interfaces/peer";
import { inject, injectable } from "inversify";
import { ValidatorBus } from "../../validators";
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
    constructor(@inject(P2PCommunicationRepository) communicationRepository: P2PCommunicationRepository,
                @inject(ValidatorBus) validatorBus: ValidatorBus) {
        super(communicationRepository);

        super.setValidatorBus(validatorBus);
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
                        try {
                            logger.info("[BlockchainAdapter] Received blockchain and states.");
                            const blockchainAndStates: [Block[], State[]] = JSON.parse(responseMessage.body as string);
    
                            super.getValidatorBus().validateAsync(blockchainAndStates[0]);
                            super.getValidatorBus().validateAsync(blockchainAndStates[1]);
                            
                            resolve(blockchainAndStates);
                        } catch (error) {
                            reject(error);
                        }
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
            async (_message: Message, _senderGuid: string, response: RESPONSE_TYPE) => {
                await this.handleBlockchainRequestAsync(response).catch((error) => logger.error(error));
            },
        );

        this.communicationRepository.addOnMessageHandler(blockchainAndStatesRequestHandler);
    }

    private handleBlockchainRequestAsync(response: RESPONSE_TYPE): Promise<void> {
        return new Promise(async (resolve) => {
            try {
                const blockchain = await super.getServiceAdapter().getBlockchainAsync();
                const states = await super.getServiceAdapter().getStatesAsync();
                const blockchainAndStates: [Block[], State[]] = [blockchain, states];

                resolve(response(new Message(
                        MessageType.BLOCKCHAIN_AND_STATES_REQUEST_RESPONSE,
                        JSON.stringify(blockchainAndStates),
                    ),
                ));
            } catch (error) {
                logger.error(error);
            }
        });
    }
}
