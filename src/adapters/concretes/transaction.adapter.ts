import { logger } from "@blockr/blockr-logger";
import { Transaction } from "@blockr/blockr-models";
import { ServerUnaryCall } from "grpc";
import { inject, injectable } from "inversify";
import { BaseAdapter, IOnMessageHandler, RPCOnMessageHandler } from "..";
import { RPCCommunicationRepository } from "../communication/repositories/concretes/rpcCommunication.repository";
import { ITransactionServiceAdapter } from "../interfaces/transactionService.adapter";

@injectable()
export class TransactionAdapter extends BaseAdapter<ITransactionServiceAdapter> {
    constructor(@inject(RPCCommunicationRepository) communicationRepository: RPCCommunicationRepository) {
        super(communicationRepository);
    }

    protected initOnMessageHandlers(): void {
        const newTransactionHandler: IOnMessageHandler = new RPCOnMessageHandler({
                addTransaction: this.handleNewTransaction,
            },
        );

        this.communicationRepository.addOnMessageHandler(newTransactionHandler);
    }

    private handleNewTransaction(serverUnaryCall: ServerUnaryCall<Transaction>): void {
        try {
            const transaction: Transaction = serverUnaryCall.request;
            this.getServiceAdapter().addPendingTransactionAsync(transaction);
        } catch (error) {
            logger.error(error);
        }
    }
}
