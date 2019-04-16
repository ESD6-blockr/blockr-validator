import { IModel } from "@blockr/blockr-models";
import { injectable, multiInject } from "inversify";
import { IValidator } from "../interfaces/validator";

@injectable()
export class ValidatorBus {
    private validators: Array<IValidator<IModel>>;

    constructor(@multiInject("Validators") validators: Array<IValidator<IModel>>) {
        this.validators = validators;
    }

    public async validateAsync(...models: IModel[]): Promise<void> {
        for (const model of models) {
            for (const validator of this.validators) {
                if (this.validatorForModel(validator, model)) {
                    await validator.validateObjectAsync(model);
                }
            }
        }
    }

    private validatorForModel(validator: IValidator<IModel>, model: IModel): boolean {
        return validator.constructor.name === `${model.constructor.name}Validator`;
    }
 }
