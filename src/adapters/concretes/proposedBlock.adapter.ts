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
import { IProposedBlockServiceAdapter } from "../interfaces/proposedBlockService.adapter";

@injectable()
export class ProposedBlockAdapter extends BaseAdapter<IProposedBlockServiceAdapter> {
    constructor(@inject(P2PCommunicationRepository) communicationRepository: P2PCommunicationRepository,
                @inject(ValidatorBus) validatorBus: ValidatorBus) {
        super(communicationRepository);

        super.setValidatorBus(validatorBus);
    }

    public async broadcastNewProposedBlock(proposedBlock: Block): Promise<void> {
        return new Promise((resolve) => {
            logger.info("[ProposedBlockAdapter] Broadcasting new proposed block.");

            const messageSendingHandler: IMessageSendingHandler = new P2PMessageSendingHandler(
                new Message(MessageType.NEW_PROPOSED_BLOCK, JSON.stringify(proposedBlock)),
            );

            resolve(this.communicationRepository.broadcastMessageAsync!(messageSendingHandler));
        });
    }

    protected initOnMessageHandlers(): void {
        const newProposedBlockHandler: IOnMessageHandler = new P2POnMessageHandler(
            MessageType.NEW_PROPOSED_BLOCK,
            async (message: Message, _senderGuid: string, _response: RESPONSE_TYPE) => {
                this.handleNewProposedBlock(message);
            },
        );

        this.communicationRepository.addOnMessageHandler(newProposedBlockHandler);
    }

    private async handleNewProposedBlock(message: Message): Promise<void> {
        return new Promise((resolve) => {
            try {
                logger.info("[ProposedBlockAdapter] Received new proposed block.");

                if (!message.body) {
                    throw new AdapterException("The required body is missing in the new proposed block's message.");
                }

                // TODO: proposedBlock is now somehow of instance object
                const proposedBlock: Block = JSON.parse(message.body) as Block;
                super.getValidatorBus().validateAsync([proposedBlock]);

                resolve(super.getServiceAdapter().addProposedBlockAsync(proposedBlock));
            } catch (error) {
                logger.error(`[${this.constructor.name}] ${error}`);
            }
        });
    }
}
