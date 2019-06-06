import { inject, injectable } from "inversify";
import { BaseAdapter } from "..";
import { RPCCommunicationRepository } from "../communication/repositories/concretes/rpcCommunication.repository";
import { ITransactionServiceAdapter } from "../interfaces/transactionService.adapter";

@injectable()
export class TransactionAdapter extends BaseAdapter<ITransactionServiceAdapter> {
    constructor(@inject(RPCCommunicationRepository) communicationRepository: RPCCommunicationRepository) {
        super(communicationRepository);
    }

    // TODO: This class should be properly implemented.

    protected initOnMessageHandlers(): void {
        // const newTransactionRequestHandler: IOnMessageHandler = new RPCOnMessageHandler({
        //         addTransaction: this.handleNewTransaction,
        //     },
        // );

        // this.communicationRepository.addOnMessageHandler(newTransactionRequestHandler);
    }

    private handleNewTransaction(): void {
        // try {
        //     this.getServiceAdapter().addPendingTransactionAsync(transaction);
        // } catch (error) {
        //     logger.error(error);
        // }
    }
}
