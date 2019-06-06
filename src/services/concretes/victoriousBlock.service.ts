import { Block } from "@blockr/blockr-models";
import { inject, injectable } from "inversify";
import { VictoriousBlockAdapter } from "../../adapters/concretes/victoriousBlock.adapter";
import { IVictoriousBlockServiceAdapter } from "../../adapters/interfaces/victoriousBlockService.adapter";

@injectable()
export class VictoriousBlockService implements IVictoriousBlockServiceAdapter {
    private readonly victoriousBlockAdapter: VictoriousBlockAdapter;

    constructor(@inject(VictoriousBlockAdapter) victoriousBlockAdapter: VictoriousBlockAdapter) {
        this.victoriousBlockAdapter = victoriousBlockAdapter;

        this.victoriousBlockAdapter.setServiceAdapter(this);
    }
    
    public async addVictoriousBlockAsync(victoriousBlock: Block): Promise<void> {
        throw new Error("Method not implemented." + victoriousBlock);
    }
}
