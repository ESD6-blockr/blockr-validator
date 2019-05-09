import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { ObjectHasher } from "../../utils/security/objectHasher.util";
import { ValidationCondition } from "../concretes/validation.condition";
import { IValidator } from "../interfaces/validator";

export abstract class BaseValidator<IModel> implements IValidator<IModel> {
    protected dataAccessLayer: DataAccessLayer;
    protected objectHasher: ObjectHasher;
    protected validationConditions: Array<ValidationCondition<IModel>> = [];

    constructor(dataAccessLayer: DataAccessLayer, objectHasher: ObjectHasher) {
        this.dataAccessLayer = dataAccessLayer;
        this.objectHasher = objectHasher;

        this.initConditions();
    }

    public async validateObjectAsync(object: IModel): Promise<[IModel, boolean]> {
        return new Promise(async (resolve, reject) => {
            try {
                logger.info(`Validating ${object.constructor.name}`);

                const isValid = this.validationConditions
                                    .every((condition: ValidationCondition<IModel>) => condition.validate(object));
    
                resolve([object, isValid]);
            } catch (error) {
                logger.error(error);

                reject(error);
            }
        });
    }

    protected abstract initConditions(): void;
}
