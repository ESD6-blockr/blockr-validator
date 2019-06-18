import { logger } from "@blockr/blockr-logger";
import { Transaction } from "@blockr/blockr-models";
import { ServerUnaryCall } from "grpc";
import { inject, injectable } from "inversify";
import { BaseAdapter, IBaseServiceAdapter, IOnMessageHandler, RPCOnMessageHandler } from "..";
import { ValidatorBus } from "../../validators";
import { RPCCommunicationRepository } from "../communication/repositories/concretes/rpcCommunication.repository";
import { ITransactionServiceAdapter } from "../interfaces/transactionService.adapter";

/**
 * Injectable
 */
@injectable()
export class TransactionAdapter extends BaseAdapter<ITransactionServiceAdapter> {
    public static serviceAdapter: IBaseServiceAdapter | undefined;
    private static staticBus: ValidatorBus;

    /**
     * Creates an instance of transaction adapter.
     * @param communicationRepository 
     * @param validatorBus 
     */
    constructor(@inject(RPCCommunicationRepository) communicationRepository: RPCCommunicationRepository,
                @inject(ValidatorBus) validatorBus: ValidatorBus) {
        super(communicationRepository, validatorBus);
        (communicationRepository as RPCCommunicationRepository).startServer();

        TransactionAdapter.staticBus = super.getValidatorBus();
    }

    /**
     * Inits on message handlers
     */
    protected initOnMessageHandlers(): void {
        const newTransactionReceivalHandler: IOnMessageHandler = new RPCOnMessageHandler({
                addTransaction: this.handleNewTransactionAsync,
            },
        );

        this.communicationRepository.addOnMessageHandler(newTransactionReceivalHandler);
    }

    /**
     * Handles new transaction async
     * @param serverUnaryCall 
     * @returns new transaction async 
     */
    private async handleNewTransactionAsync(serverUnaryCall: ServerUnaryCall<any>): Promise<void> {
        return new Promise(async (resolve) => {
            try {
                logger.info("[TransactionAdapter] Received new transaction.");
                serverUnaryCall = serverUnaryCall;
                const transaction: Transaction = serverUnaryCall.request.Transaction;
                
                // Hotfix
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
