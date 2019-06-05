import { Transaction } from "@blockr/blockr-models";
import { loadSync } from "@grpc/proto-loader";
import { loadPackageDefinition, Server, ServerCredentials } from "grpc";
import { injectable } from "inversify";

const PROTOCOL_PATH = "../../utils/transactions.proto";
const HOST = "127.0.0.1";
const PORT = "5678";

@injectable()
export class RpcTransactionService {
  // No type exists for this property as it is defined in the protocol (.proto) file, hence any.
  private transactionProto: any;

  constructor() {
    const packageDefinition = loadSync(
      PROTOCOL_PATH,
      {
        defaults: true,
        enums: String,
        keepCase: true,
        longs: String,
        oneofs: true,
      });
    this.transactionProto = loadPackageDefinition(packageDefinition).transactions;
  }

  public getServer(): Server {
    const server = new Server();
    server.addProtoService(this.transactionProto.TransactionRpcService.service, {
      addTransaction: this.addTransaction,
    });

    server.bind(`${HOST}:${PORT}`, ServerCredentials.createInsecure());
    server.start();
    return server;
  }

  public addTransaction(transaction: Transaction) {
    // Call addTransaction()
  }
}
