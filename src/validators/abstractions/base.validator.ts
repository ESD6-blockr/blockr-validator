import { ObjectHasher } from "@blockr/blockr-crypto";
import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { ValidationCondition } from "../concretes/validation.condition";
import { IValidator } from "../interfaces/validator";

/**
 * Base validator
 * @template T 
 */
export abstract class BaseValidator<T> implements IValidator<T> {
    protected dataAccessLayer: DataAccessLayer;
    protected objectHasher: ObjectHasher;
    protected validationConditions: Array<ValidationCondition<T>> = [];

    /**
     * Creates an instance of base validator.
     * @param dataAccessLayer 
     * @param objectHasher 
     */
    constructor(dataAccessLayer: DataAccessLayer, objectHasher: ObjectHasher) {
        this.dataAccessLayer = dataAccessLayer;
        this.objectHasher = objectHasher;

        this.initConditions();
    }

    /**
     * Validates object async
     * @param object 
     * @returns object async 
     */
    public async validateObjectAsync(object: T): Promise<[T, boolean]> {
        return new Promise(async (resolve, reject) => {
            try {
                logger.info(`[${this.constructor.name}] Validating ${(object as unknown as object).constructor.name}`);

                const isValid = await this.everyConditionIsValidAsync(object, this.validationConditions);
    
                resolve([object, isValid]);
            } catch (error) {
                logger.error(`[${this.constructor.name}] ${error}`);

                reject(error);
            }
        });
    }

    /**
     * Inits conditions
     */
    protected abstract initConditions(): void;

    /**
     * Everys condition is valid async
     * @param object 
     * @param conditions 
     * @returns condition is valid async 
     */
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
