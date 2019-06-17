import { logger } from "@blockr/blockr-logger";
import { Transaction } from "@blockr/blockr-models";
import { ServerUnaryCall } from "grpc";
import { inject, injectable } from "inversify";
import { BaseAdapter, IBaseServiceAdapter, IOnMessageHandler, RPCOnMessageHandler } from "..";
import { ValidatorBus } from "../../validators";
import { RPCCommunicationRepository } from "../communication/repositories/concretes/rpcCommunication.repository";
import { ITransactionServiceAdapter } from "../interfaces/transactionService.adapter";

@injectable()
export class TransactionAdapter extends BaseAdapter<ITransactionServiceAdapter> {
    public static serviceAdapter: IBaseServiceAdapter | undefined;
    private static staticBus: ValidatorBus;

    constructor(@inject(RPCCommunicationRepository) communicationRepository: RPCCommunicationRepository,
                @inject(ValidatorBus) validatorBus: ValidatorBus) {
        super(communicationRepository, validatorBus);
        (communicationRepository as RPCCommunicationRepository).startServer();

        TransactionAdapter.staticBus = super.getValidatorBus();
    }

    protected initOnMessageHandlers(): void {
        const newTransactionReceivalHandler: IOnMessageHandler = new RPCOnMessageHandler({
                addTransaction: this.handleNewTransactionAsync,
            },
        );

        this.communicationRepository.addOnMessageHandler(newTransactionReceivalHandler);
    }

    private async handleNewTransactionAsync(serverUnaryCall: ServerUnaryCall<Transaction>): Promise<void> {
        return new Promise(async (resolve) => {
            try {
                serverUnaryCall = serverUnaryCall;
                const transaction: Transaction = serverUnaryCall.request;
                
                // console.log(this);

                // const kutbus = DI_CONTAINER.get<ValidatorBus>(ValidatorBus);
                // await kutbus.validateAsync([transaction]);

                await TransactionAdapter.staticBus.validateAsync([transaction]);
                await (TransactionAdapter.serviceAdapter as ITransactionServiceAdapter)
                    .addPendingTransactionAsync(transaction);

                resolve();
            } catch (error) {
                logger.error(`[${this.constructor.name}] ${error}`);
            }
        });
    }
}
