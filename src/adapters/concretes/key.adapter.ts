import { logger } from "@blockr/blockr-logger";
import { Message, PeerType } from "@blockr/blockr-p2p-lib";
import { RESPONSE_TYPE } from "@blockr/blockr-p2p-lib/dist/interfaces/peer";
import { inject, injectable } from "inversify";
import { BaseAdapter, MessageType } from "..";
import { P2PMessageSendingHandler } from "../communication/handlers/concretes/p2pMessageSending.handler";
import { P2POnMessageHandler } from "../communication/handlers/concretes/p2pOnMessage.handler";
import { IMessageSendingHandler } from "../communication/handlers/interfaces/messageSending.handler";
import { IOnMessageHandler } from "../communication/handlers/interfaces/onMessage.handler";
import { P2PCommunicationRepository } from "../communication/repositories/concretes/p2pCommunication.repository";
import { IKeyServiceAdapter } from "../interfaces/keyService.adapter";

/**
 * Injectable
 */
@injectable()
export class KeyAdapter extends BaseAdapter<IKeyServiceAdapter> {
    constructor(@inject(P2PCommunicationRepository) communicationRepository: P2PCommunicationRepository) {
        super(communicationRepository);
    }

    /**
     * Requests the admin key from a random validator within the peer-to-peer network
     */
    public async requestAdminKeyAsync(): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const message = new Message(MessageType.ADMIN_KEY_REQUEST);
                const handler: IMessageSendingHandler = new P2PMessageSendingHandler(
                    message,
                    PeerType.VALIDATOR,
                    (responseMessage: Message) => {
                        const key: string = responseMessage.body as string;
                        
                        resolve(key);
                    },
                );
            
                await this.communicationRepository.sendMessageToRandomNodeAsync!(handler);
                await (this.communicationRepository as P2PCommunicationRepository).getPromiseForResponse(message);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Inits on message handlers
     */
    protected initOnMessageHandlers(): void {
        const adminKeyRequestHandler: IOnMessageHandler = new P2POnMessageHandler(
            MessageType.ADMIN_KEY_REQUEST,
            async (_message: Message, _senderGuid: string, response: RESPONSE_TYPE) => {
                await this.handleAdminKeyRequestAsync(response).catch((error) =>
                    logger.error(`[${this.constructor.name}] ${error}`));
            },
        );

        this.communicationRepository.addOnMessageHandler(adminKeyRequestHandler);
    }

    /**
     * Handles admin key request async
     * @param response 
     * @returns admin key request async 
     */
    private handleAdminKeyRequestAsync(response: RESPONSE_TYPE): Promise<void> {
        return new Promise(async (resolve) => {
            try {
                logger.info("[KeyAdapter] Sending admin key to node as per request.");
                const key: string = await super.getServiceAdapter().getAdminKey();
                
                response(new Message(
                    MessageType.ADMIN_KEY_REQUEST_RESPONSE,
                    key,
                ));
                
                resolve();
            } catch (error) {
                logger.error(`[${this.constructor.name}] ${error}`);
            }
        });
    }
}
