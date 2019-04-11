import { DataAccessLayer } from "@blockr/blockr-data-access";
import Logger from "../../utils/logger";
import { ObjectHasher } from "../../utils/objectHasher";
import { ValidationCondition } from "../concretes/validationCondition";
import { IValidator } from "../interfaces/validator";

export abstract class BaseValidator<T> implements IValidator<T> {
    protected dataAccessLayer: DataAccessLayer;
    protected objectHasher: ObjectHasher;
    protected validationConditions: Array<ValidationCondition<T>> = [];

    constructor(dataAccessLayer: DataAccessLayer, objectHasher: ObjectHasher) {
        this.dataAccessLayer = dataAccessLayer;
        this.objectHasher = objectHasher;

        this.initConditions();
    }

    public async validateObjectAsync(object: T): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                Logger.info(`Validating ${object}`);
                
                const isValid = this.validationConditions
                                    .every((condition: ValidationCondition<T>) => condition.validate(object));
    
                resolve(isValid);
            } catch (error) {
                Logger.error(error);

                reject(error);
            }
        });
    }

    protected abstract initConditions(): void;
}
