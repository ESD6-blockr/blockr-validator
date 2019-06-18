import { Message, PeerType } from "@blockr/blockr-p2p-lib";
import { RESPONSE_TYPE } from "@blockr/blockr-p2p-lib/dist/interfaces/peer";
import { IMessageSendingHandler } from "../interfaces/messageSending.handler";

/**
 * P2 pmessage sending handler
 */
export class P2PMessageSendingHandler implements IMessageSendingHandler {
    public readonly message: Message;
    public readonly peerType?: PeerType;
    public readonly responseImplementation?: RESPONSE_TYPE;

    /**
     * Creates an instance of p2 pmessage sending handler.
     * @param message 
     * @param [peerType] 
     * @param [responseImplementation] 
     */
    constructor(message: Message, peerType?: PeerType, responseImplementation?: RESPONSE_TYPE) {
        this.message = message;
        this.peerType = peerType;
        this.responseImplementation = responseImplementation;
    }
}
