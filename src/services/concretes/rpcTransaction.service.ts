import { Transaction } from "@blockr/blockr-models";
import * as protoLoader from "@grpc/proto-loader";
import * as grpc from "grpc";
import { injectable } from "inversify";

const PROTO_PATH = "../../utils/transactions.proto";
const HOST = "127.0.0.1";
const PORT = "5678";

@injectable()
export class RpcTransactionService {
  private transactionProto: any;

  constructor() {
    const packageDefinition = protoLoader.loadSync(
      PROTO_PATH,
      {
        defaults: true,
        enums: String,
        keepCase: true,
        longs: String,
        oneofs: true,
      });
    this.transactionProto = grpc.loadPackageDefinition(packageDefinition).transactions;
  }

  public getServer(): grpc.Server {
    const server = new grpc.Server();
    server.addProtoService(this.transactionProto.TransactionRpcService.service, {
      addTransaction: this.addTransaction,
    });

    server.bind(`${HOST}:${PORT}`, grpc.ServerCredentials.createInsecure());
    server.start();
    return server;
  }

  public addTransaction(transaction: Transaction) {
    // Call addTransaction()
  }
}
