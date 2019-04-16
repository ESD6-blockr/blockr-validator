import { DataAccessLayer } from "@blockr/blockr-data-access";
import { inject } from "inversify";
import { ValidatorBus } from "../../validators";

export class NodeService {
    private validatorBus: ValidatorBus;
    private dataAccessLayer: DataAccessLayer;

    constructor(@inject(ValidatorBus) validatorBus: ValidatorBus,
                @inject(DataAccessLayer) dataAccessLayer: DataAccessLayer) {
        this.validatorBus = validatorBus;
        this.dataAccessLayer = dataAccessLayer;
    }
}
