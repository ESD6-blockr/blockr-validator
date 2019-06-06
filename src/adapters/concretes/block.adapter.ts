import { logger } from "@blockr/blockr-logger";
import { Block } from "@blockr/blockr-models";
import { Message } from "@blockr/blockr-p2p-lib";
import { RESPONSE_TYPE } from "@blockr/blockr-p2p-lib/dist/interfaces/peer";
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
import { IBlockServiceAdapter } from "../interfaces/blockService.adapter";

@injectable()
export class BlockAdapter extends BaseAdapter<IBlockServiceAdapter> {
    constructor(@inject(P2PCommunicationRepository) communicationRepository: P2PCommunicationRepository,
                @inject(ValidatorBus) validatorBus: ValidatorBus) {
        super(communicationRepository);

        this.setValidatorBus(validatorBus);
    }

    public async broadcastNewProposedBlock(proposedBlock: Block): Promise<void> {
        return new Promise((resolve) => {
            logger.info("[BlockAdapter] Broadcasting new proposed block.");

            const messageSendingHandler: IMessageSendingHandler = new P2PMessageSendingHandler(
                new Message(MessageType.NEW_PROPOSED_BLOCK, JSON.stringify(proposedBlock)),
            );

            resolve(this.communicationRepository.broadcastMessageAsync!(messageSendingHandler));
        });
    }

    public async broadcastNewVictoriousBlock(victoriousBlock: Block): Promise<void> {
        return new Promise((resolve) => {
            logger.info("[BlockAdapter] Broadcasting new victorious block.");

            const messageSendingHandler: IMessageSendingHandler = new P2PMessageSendingHandler(
                new Message(MessageType.NEW_VICTORIOUS_BLOCK, JSON.stringify(victoriousBlock)),
            );

            resolve(this.communicationRepository.broadcastMessageAsync!(messageSendingHandler));
        });
    }

    // TODO: Add logging

    protected initOnMessageHandlers(): void {
        const newProposedBlockHandler: IOnMessageHandler = new P2POnMessageHandler(
            MessageType.NEW_PROPOSED_BLOCK,
            async (message: Message, _senderGuid: string, _response: RESPONSE_TYPE) => {
                this.handleNewProposedBlock(message);
            },
        );
        const newVictoriousBlockHandler: IOnMessageHandler = new P2POnMessageHandler(
            MessageType.NEW_VICTORIOUS_BLOCK,
            async (message: Message, _senderGuid: string, _response: RESPONSE_TYPE) => {
                this.handleNewVictoriousBlock(message);
            },
        );

        this.communicationRepository.addOnMessageHandler(newProposedBlockHandler);
        this.communicationRepository.addOnMessageHandler(newVictoriousBlockHandler);
    }

    private async handleNewProposedBlock(message: Message): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                logger.info("[BlockAdapter] Received new proposed block.");

                if (!message.body) {
                    throw new AdapterException("The required body is missing in the new proposed block's message.");
                }

                const proposedBlock: Block = JSON.parse(message.body);
                this.getValidatorBus().validateAsync([proposedBlock]);

                resolve(this.getServiceAdapter().addProposedBlockAsync(proposedBlock));
            } catch (error) {
                reject(error);
            }
        });
    }

    private async handleNewVictoriousBlock(message: Message): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                logger.info("[BlockAdapter] Received new victorious block.");

                if (!message.body) {
                    throw new AdapterException("The required body is missing in the new victorious block's message.");
                }

                const victoriousBlock: Block = JSON.parse(message.body);
                this.getValidatorBus().validateAsync([victoriousBlock]);

                resolve(this.getServiceAdapter().addVictoriousBlockAsync(victoriousBlock));
            } catch (error) {
                reject(error);
            }
        });
    }
}
