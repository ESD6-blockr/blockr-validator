import { loadSync } from "@grpc/proto-loader";
import { loadPackageDefinition, Server, ServerCredentials } from "grpc";
import { inject, injectable } from "inversify";
import { AdapterException } from "../../../../exceptions/adapter.exception";
import { ConstantStore } from "../../../../stores";
import { RPCOnMessageHandler } from "../../handlers/concretes/rpcOnMessage.handler";
import { IOnMessageHandler } from "../../handlers/interfaces/onMessage.handler";
import { ICommunicationRepository } from "../interfaces/communication.repository";

@injectable()
export class RPCCommunicationRepository implements ICommunicationRepository {
    private readonly constantStore: ConstantStore;
    // No type exists for this property as it is defined in the protocol (.proto) file, hence any.
    private readonly transactionPrototype: any;
    private readonly server: Server;
    
    constructor(@inject(ConstantStore) constantStore: ConstantStore) {
        this.constantStore = constantStore;

        const packageDefinition = loadSync(
            this.constantStore.RPC_PROTOCOL_FILE_PATH, {
              defaults: true,
              enums: String,
              keepCase: true,
              longs: String,
              oneofs: true,
            });

        this.transactionPrototype = loadPackageDefinition(packageDefinition).transactions;
        this.server = this.initServer();
    }

    public addOnMessageHandler(onMessageHandler: IOnMessageHandler): void {
        if (!(onMessageHandler instanceof RPCOnMessageHandler)) {
            throw new AdapterException("The given onMessageHandler is not of the required type RPCOnMessageHandler.");
        }

        this.server.addProtoService(this.transactionPrototype.TransactionRpcService.service,
                                    onMessageHandler.implementation);
    }

    private initServer(): Server {
        const server = new Server();
        server.bind(`${this.constantStore.RPC_SERVER_HOST}:${this.constantStore.RPC_SERVER_PORT}`,
                    ServerCredentials.createInsecure());
        server.start();
    
        return server;
      }
}
