import { ObjectHasher } from "@blockr/blockr-crypto";
import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { ValidationCondition } from "../concretes/validation.condition";
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

    public async validateObjectAsync(object: T): Promise<[T, boolean]> {
        return new Promise(async (resolve, reject) => {
            try {
                logger.info(`Validating ${(object as unknown as object).constructor.name}`);

                const isValid = await this.everyConditionIsValidAsync(object, this.validationConditions);
    
                resolve([object, isValid]);
            } catch (error) {
                logger.error(`[${this.constructor.name}] ${error}`);

                reject(error);
            }
        });
    }

    protected abstract initConditions(): void;

    protected async everyConditionIsValidAsync(object: T, conditions: Array<ValidationCondition<T>>)
                                            : Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            for (const validationCondition of conditions) {
                try {
                    await validationCondition.validateAsync(object);
                } catch (error) {
                    reject(error);
                }
            }

            resolve(true);
        });
    }
}
