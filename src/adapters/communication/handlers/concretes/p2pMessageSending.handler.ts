import { Message, PeerType } from "@blockr/blockr-p2p-lib";
import { RESPONSE_TYPE } from "@blockr/blockr-p2p-lib/dist/interfaces/peer";
import { IMessageSendingHandler } from "../interfaces/messageSending.handler";

export class P2PMessageSendingHandler implements IMessageSendingHandler {
    public readonly message: Message;
    public readonly peerType?: PeerType;
    public readonly responseImplementation?: RESPONSE_TYPE;

    constructor(message: Message, peerType?: PeerType, responseImplementation?: RESPONSE_TYPE) {
        this.message = message;
        this.peerType = peerType;
        this.responseImplementation = responseImplementation;
    }
}
