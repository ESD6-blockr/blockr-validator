import { logger } from "@blockr/blockr-logger";
import { IModel } from "@blockr/blockr-models";
import { injectable, multiInject } from "inversify";
import { ValidatorBusException } from "../../exceptions/validatorBus.exception";
import { IValidator } from "../interfaces/validator";

/**
 * Injectable
 */
@injectable()
export class ValidatorBus {
    private readonly validators: Array<IValidator<IModel>>;

    /**
     * Creates an instance of validator bus.
     * @param validators 
     */
    constructor(@multiInject("Validators") validators: Array<IValidator<IModel>>) {
        this.validators = validators;
    }

    /**
     * Validates async
     * @param models 
     * @returns async 
     */
    public async validateAsync(models: IModel[]): Promise<Array<[IModel, boolean]>> {
        const promises: Array<Promise<[IModel, boolean]>> = [];

        for (const model of models) {
            let validator: IValidator<IModel>;

            try {
                validator = this.validatorForModel(model);
            } catch (error) {
                logger.warn(error.message);
                continue;
            }

            promises.push(validator.validateObjectAsync(model));
        }

        return Promise.all(promises);
    }

    /**
     * Validators for model
     * @param model 
     * @returns for model 
     */
    private validatorForModel(model: IModel): IValidator<IModel> {
        for (const validator of this.validators) {
            if (validator.constructor.name === `${model.constructor.name}Validator`) {
                return validator;
            }
        }

        throw new ValidatorBusException(`[${this.constructor.name}] ` +
            `${model.constructor.name} does not have a validator`);
    }
 }
