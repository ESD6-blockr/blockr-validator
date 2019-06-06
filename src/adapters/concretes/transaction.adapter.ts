import { logger } from "@blockr/blockr-logger";
import { Transaction } from "@blockr/blockr-models";
import { ServerUnaryCall } from "grpc";
import { inject, injectable } from "inversify";
import { BaseAdapter, IOnMessageHandler, RPCOnMessageHandler } from "..";
import { ValidatorBus } from "../../validators";
import { RPCCommunicationRepository } from "../communication/repositories/concretes/rpcCommunication.repository";
import { ITransactionServiceAdapter } from "../interfaces/transactionService.adapter";

@injectable()
export class TransactionAdapter extends BaseAdapter<ITransactionServiceAdapter> {
    constructor(@inject(RPCCommunicationRepository) communicationRepository: RPCCommunicationRepository,
                @inject(ValidatorBus) validatorBus: ValidatorBus) {
        super(communicationRepository);

        super.setValidatorBus(validatorBus);
    }

    protected initOnMessageHandlers(): void {
        const newTransactionReceivalHandler: IOnMessageHandler = new RPCOnMessageHandler({
                addTransaction: this.handleNewTransactionAsync,
            },
        );

        this.communicationRepository.addOnMessageHandler(newTransactionReceivalHandler);
    }

    private async handleNewTransactionAsync(serverUnaryCall: ServerUnaryCall<Transaction>): Promise<void> {
        return new Promise((resolve) => {
            try {
                const transaction: Transaction = serverUnaryCall.request;
    
                super.getValidatorBus().validateAsync([transaction]);
                super.getServiceAdapter().addPendingTransactionAsync(transaction);
                
                resolve();
            } catch (error) {
                logger.error(error);
            }
        });
    }
}
