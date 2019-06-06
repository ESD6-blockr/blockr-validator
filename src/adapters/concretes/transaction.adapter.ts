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

        this.setValidatorBus(validatorBus);
    }

    protected initOnMessageHandlers(): void {
        const newTransactionReceivalHandler: IOnMessageHandler = new RPCOnMessageHandler({
                addTransaction: this.handleNewTransactionReceival,
            },
        );

        this.communicationRepository.addOnMessageHandler(newTransactionReceivalHandler);
    }

    private handleNewTransactionReceival(serverUnaryCall: ServerUnaryCall<Transaction>): void {
        try {
            const transaction: Transaction = serverUnaryCall.request;

            this.getValidatorBus().validateAsync([transaction]);
            this.getServiceAdapter().addPendingTransactionAsync(transaction);
        } catch (error) {
            logger.error(error);
        }
    }
}
