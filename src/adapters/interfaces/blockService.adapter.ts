import { Block } from "@blockr/blockr-models";
import { IBaseServiceAdapter } from "./baseService.adapter";

export interface IBlockServiceAdapter extends IBaseServiceAdapter {
    addPendingProposedBLockAsync(proposedBlock: Block): Promise<void>;
}
