import { Message, Peer, PeerType } from "@blockr/blockr-p2p-lib";
import { inject, injectable } from "inversify";
import { AdapterException } from "../../../../exceptions/adapter.exception";
import { P2PMessageSendingHandler } from "../../handlers/concretes/p2pMessageSending.handler";
import { P2POnMessageHandler } from "../../handlers/concretes/p2pOnMessage.handler";
import { IMessageSendingHandler } from "../../handlers/interfaces/messageSending.handler";
import { IOnMessageHandler } from "../../handlers/interfaces/onMessage.handler";
import { ICommunicationRepository } from "../interfaces/communication.repository";

@injectable()
export class P2PCommunicationRepository implements ICommunicationRepository {
    private readonly peer: Peer;
    
    constructor(@inject(Peer) peer: Peer) {
        this.peer = peer;
    }

    public addOnMessageHandler(onMessageHandler: IOnMessageHandler): void {
        if (!(onMessageHandler instanceof P2POnMessageHandler)) {
            throw new AdapterException("The given onMessageHandler is not of the required type P2POnMessageHandler.");
        }

        this.peer.registerReceiveHandlerForMessageType(onMessageHandler.messageType, onMessageHandler.implementation);
    }

    public async sendMessageToRandomNodeAsync(messageSendingHandler: IMessageSendingHandler): Promise<void> {
        this.validateMessageSendingHandler(messageSendingHandler);
        const handler: P2PMessageSendingHandler = messageSendingHandler as P2PMessageSendingHandler;

        if (!handler.peerType) {
            throw new AdapterException("The MessageSendingHandler does not contain the required PeerType.");
        }

        return this.peer.sendMessageToRandomPeerAsync(
            handler.message,
            handler.peerType,
            handler.responseImplementation,
        );
    }

    public async broadcastMessageAsync(messageSendingHandler: IMessageSendingHandler): Promise<void> {
        this.validateMessageSendingHandler(messageSendingHandler);
        const handler: P2PMessageSendingHandler = messageSendingHandler as P2PMessageSendingHandler;
        
        this.peer.sendBroadcastAsync(handler.message, handler.responseImplementation);
    }

    public getPeerOfType(peerType: PeerType): [string, string] | undefined {
        return this.peer.getPeerOfType(peerType);
    }

    public getPromiseForResponse(message: Message): Promise<void> {
        return this.peer.getPromiseForResponse(message);
    }

    private validateMessageSendingHandler(messageSendingHandler: IMessageSendingHandler): void {
        if (!(messageSendingHandler instanceof P2PMessageSendingHandler)) {
            throw new AdapterException
                ("The given messageSendingHandler is not of the required type P2PMessageSendingHandler.");
        }
    }
}
