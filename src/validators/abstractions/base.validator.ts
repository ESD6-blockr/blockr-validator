import { ObjectHasher } from "@blockr/blockr-crypto";
import { DataAccessLayer } from "@blockr/blockr-data-access";
import { logger } from "@blockr/blockr-logger";
import { ValidationCondition } from "../concretes/validation.condition";
import { IValidator } from "../interfaces/validator";

export abstract class BaseValidator<IModel> implements IValidator<IModel> {
    protected readonly dataAccessLayer: DataAccessLayer;
    protected readonly objectHasher: ObjectHasher;
    protected readonly validationConditions: Array<ValidationCondition<IModel>> = [];

    constructor(dataAccessLayer: DataAccessLayer, objectHasher: ObjectHasher) {
        this.dataAccessLayer = dataAccessLayer;
        this.objectHasher = objectHasher;

        this.initConditions();
    }

    public async validateObjectAsync(object: IModel): Promise<[IModel, boolean]> {
        return new Promise(async (resolve, reject) => {
            try {
                logger.info(`Validating ${(object as unknown as object).constructor.name}`);

                const isValid = await this.everyConditionIsValidAsync(object, this.validationConditions);
    
                resolve([object, isValid]);
            } catch (error) {
                logger.error(error);

                reject(error);
            }
        });
    }

    protected abstract initConditions(): void;

    private async everyConditionIsValidAsync(object: IModel, conditions: Array<ValidationCondition<IModel>>)
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
