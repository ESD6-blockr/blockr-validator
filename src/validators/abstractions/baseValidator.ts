import { DataAccessLayer } from "@blockr/blockr-data-access";
import Logger from "../../utils/logger";
import { ValidationCondition } from "../concretes/validationCondition";
import { IValidator } from "../interfaces/validator";

export abstract class BaseValidator<T> implements IValidator<T> {
    protected dataAccessLayer: DataAccessLayer;
    protected validationConditions: Array<ValidationCondition<T>> = [];

    constructor(dataAccessLayer: DataAccessLayer) {
        this.dataAccessLayer = dataAccessLayer;
    }

    // TODO: Maak validating daadwerkelijk Async.
    // TODO: ValidationException aanmaken en gebruiken in ValidationCondition ipv Exception.
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
}
