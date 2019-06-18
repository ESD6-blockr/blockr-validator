import { logger } from "@blockr/blockr-logger";
import { Block } from "@blockr/blockr-models";
import { Message } from "@blockr/blockr-p2p-lib";
import { RESPONSE_TYPE } from "@blockr/blockr-p2p-lib/dist/interfaces/peer";
import { plainToClass } from "class-transformer";
import { inject, injectable } from "inversify";
import { MessageType } from "..";
import { AdapterException } from "../../exceptions/adapter.exception";
import { ValidatorBus } from "../../validators";
import { BaseAdapter } from "../abstractions/base.adapter";
import { P2PMessageSendingHandler } from "../communication/handlers/concretes/p2pMessageSending.handler";
import { P2POnMessageHandler } from "../communication/handlers/concretes/p2pOnMessage.handler";
import { IMessageSendingHandler } from "../communication/handlers/interfaces/messageSending.handler";
import { IOnMessageHandler } from "../communication/handlers/interfaces/onMessage.handler";
import { P2PCommunicationRepository } from "../communication/repositories/concretes/p2pCommunication.repository";
import { IVictoriousBlockServiceAdapter } from "../interfaces/victoriousBlockService.adapter";

/**
 * Injectable
 */
@injectable()
export class VictoriousBlockAdapter extends BaseAdapter<IVictoriousBlockServiceAdapter> {
    constructor(@inject(P2PCommunicationRepository) communicationRepository: P2PCommunicationRepository,
                @inject(ValidatorBus) validatorBus: ValidatorBus) {
        super(communicationRepository, validatorBus);
    }

    /**
     * Broadcasts new victorious block async
     * @param victoriousBlock 
     * @returns new victorious block async 
     */
    public async broadcastNewVictoriousBlockAsync(victoriousBlock: Block): Promise<void> {
        return new Promise(async (resolve) => {
            logger.info("[VictoriousBlockAdapter] Broadcasting new victorious block.");

            const messageSendingHandler: IMessageSendingHandler = new P2PMessageSendingHandler(
                new Message(MessageType.NEW_VICTORIOUS_BLOCK, JSON.stringify(victoriousBlock)),
            );

            await this.communicationRepository.broadcastMessageAsync!(messageSendingHandler);

            resolve();
        });
    }

    /**
     * Inits on message handlers
     */
    protected initOnMessageHandlers(): void {
        const newVictoriousBlockHandler: IOnMessageHandler = new P2POnMessageHandler(MessageType.NEW_VICTORIOUS_BLOCK,
            async (message: Message, _senderGuid: string, _response: RESPONSE_TYPE) => {
                await this.handleNewVictoriousBlockAsync(message);
            },
        );

        this.communicationRepository.addOnMessageHandler(newVictoriousBlockHandler);
    }

    /**
     * Handles new victorious block async
     * @param message 
     * @returns new victorious block async 
     */
    private async handleNewVictoriousBlockAsync(message: Message): Promise<void> {
        return new Promise(async (resolve) => {
            try {
                logger.info("[VictoriousBlockAdapter] Received new victorious block.");

                if (!message.body) {
                    throw new AdapterException("The required body is missing in the new victorious block's message.");
                }

                const victoriousBlock: Block = plainToClass<Block, any>(Block, JSON.parse(message.body) as object);
                
                await super.getValidatorBus().validateAsync([victoriousBlock]);

                await super.getServiceAdapter().addVictoriousBlockAsync(victoriousBlock)

                resolve();
            } catch (error) {
                logger.error(`[${this.constructor.name}] ${error}`);
            }
        });
    }
}
