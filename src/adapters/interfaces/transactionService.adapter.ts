import { Transaction } from "@blockr/blockr-models";
import { IBaseServiceAdapter } from "./baseService.adapter";

export interface ITransactionServiceAdapter extends IBaseServiceAdapter {
    addPendingTransactionAsync(transaction: Transaction): Promise<void>;
}
