import { logger } from "@blockr/blockr-logger";
import { Message, Peer, PeerType } from "@blockr/blockr-p2p-lib";
import { RESPONSE_TYPE } from "@blockr/blockr-p2p-lib/dist/interfaces/peer";
import { inject, injectable } from "inversify";
import { BaseAdapter, MessageType } from "..";
import { IKeyServiceAdapter } from "../interfaces/key.adapter";

@injectable()
export class KeyAdapter extends BaseAdapter<IKeyServiceAdapter> {
    constructor(@inject(Peer) peer: Peer) {
        super(peer);
    }

    /**
     * Requests the admin key from a random validator within the peer-to-peer network
     */
    public async requestAdminKeyAsync(): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const message = new Message(MessageType.ADMIN_KEY_REQUEST);
            
                this.peer.sendMessageToRandomPeerAsync(message, PeerType.VALIDATOR, (responseMessage: Message) => {
                    const key: string = responseMessage.body as string;
                    
                    resolve(key);
                });
                await this.peer.getPromiseForResponse(message);
            } catch (error) {
                reject(error);
            }
        });
    }

    protected initReceiveHandlers(): void {
        this.peer.registerReceiveHandlerForMessageType(MessageType.ADMIN_KEY_REQUEST,
                async (message: Message, senderGuid: string, response: RESPONSE_TYPE) => {
            await this.handleAdminKeyRequest(message, senderGuid, response).catch((error) => logger.error(error));
        });
    }

    private handleAdminKeyRequest(_message: Message, _senderGuid: string, response: RESPONSE_TYPE): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const key: string = await this.getAdapter().getAdminKeyFromFileAsync();

                resolve(response(new Message(
                        MessageType.ADMIN_KEY_REQUEST_RESPONSE,
                        key,
                    ),
                ));
            } catch (error) {
                reject(error);
            }
        });
    }
}
