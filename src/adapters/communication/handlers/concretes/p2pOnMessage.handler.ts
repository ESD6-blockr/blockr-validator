import { RECEIVE_HANDLER_TYPE } from "@blockr/blockr-p2p-lib/dist/interfaces/peer";
import { MessageType } from "../../../enums/messageType.enum";
import { IOnMessageHandler } from "../interfaces/onMessage.handler";

export class P2POnMessageHandler implements IOnMessageHandler {
    public readonly messageType: MessageType;
    public readonly implementation: RECEIVE_HANDLER_TYPE;

    constructor(messageType: MessageType, implementation: RECEIVE_HANDLER_TYPE) {
        this.messageType = messageType;
        this.implementation = implementation;
    }
}
