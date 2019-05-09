import { Message } from "./message.model";
import { IPeerMock } from "./peer";

export class PeerMockConcrete implements IPeerMock {
    public registerReceiveHandlerImpl(messageType: string,
                                      implementation: (message: Message, senderIp: string) => void): void {
        messageType = messageType;
        implementation = implementation;
        throw new Error("Method not implemented.");
    }
    
    public sendMessage(messageType: string, destinationIp: string, body?: string | undefined): void {
        messageType = messageType;
        destinationIp = destinationIp;
        body = body;
        throw new Error("Method not implemented.");
    }
    public broadcastMessage(messageType: string, body?: string | undefined): void {
        messageType = messageType;
        body = body;
        throw new Error("Method not implemented.");
    }
}
