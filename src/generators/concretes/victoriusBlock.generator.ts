import { Block, Transaction, TransactionType } from "@blockr/blockr-models";
import { BlockGeneratorException } from "app/exceptions";
import { BlockGenerator } from "app/generators";
import { ObjectSigner } from "app/utils";
import { inject, injectable } from "inversify";

@injectable()
export class VictoriusBlockGenerator extends BlockGenerator {
    constructor(@inject(ObjectSigner) objectSigner: ObjectSigner) {
        super(objectSigner);
    }
}
