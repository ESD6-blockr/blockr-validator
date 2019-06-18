import { RECEIVE_HANDLER_TYPE } from "@blockr/blockr-p2p-lib/dist/interfaces/peer";
import { MessageType } from "../../../enums/messageType.enum";
import { IOnMessageHandler } from "../interfaces/onMessage.handler";

/**
 * P2 pon message handler
 */
export class P2POnMessageHandler implements IOnMessageHandler {
    public readonly messageType: MessageType;
    public readonly implementation: RECEIVE_HANDLER_TYPE;

    /**
     * Creates an instance of p2 pon message handler.
     * @param messageType 
     * @param implementation 
     */
    constructor(messageType: MessageType, implementation: RECEIVE_HANDLER_TYPE) {
        this.messageType = messageType;
        this.implementation = implementation;
    }
}
