import { Block } from "@blockr/blockr-models";
import { Message } from "@blockr/blockr-p2p-lib";
import { inject, injectable } from "inversify";
import { MessageType } from "..";
import { ValidatorBus } from "../../validators";
import { BaseAdapter } from "../abstractions/base.adapter";
import { P2PMessageSendingHandler } from "../communication/handlers/concretes/p2pMessageSending.handler";
import { IMessageSendingHandler } from "../communication/handlers/interfaces/messageSending.handler";
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
            const messageSendingHandler: IMessageSendingHandler = new P2PMessageSendingHandler(
                new Message(MessageType.NEW_PROPOSED_BLOCK, JSON.stringify(proposedBlock)),
            );

            resolve(this.communicationRepository.broadcastMessageAsync!(messageSendingHandler));
        });
    }

    public async broadcastNewVictoriousBlock(victoriousBlock: Block): Promise<void> {
        return new Promise((resolve) => {
            const messageSendingHandler: IMessageSendingHandler = new P2PMessageSendingHandler(
                new Message(MessageType.NEW_VICTORIOUS_BLOCK, JSON.stringify(victoriousBlock)),
            );

            resolve(this.communicationRepository.broadcastMessageAsync!(messageSendingHandler));
        });
    }

    protected initOnMessageHandlers(): void {
        throw new Error("Method not implemented.");
    }
}
