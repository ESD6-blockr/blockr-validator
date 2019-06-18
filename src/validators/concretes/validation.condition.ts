import { ValidationException } from "../../exceptions";

/**
 * Validation condition
 * @template T 
 */
export class ValidationCondition<T> {
    /**
     * Determines whether not null nor undefined is
     * @template K 
     * @param object 
     * @returns true if not null nor undefined 
     */
    public static isNotNullNorUndefined<K>(object: K): boolean {
        return !(object === null || object === undefined);
    }

    private readonly condition: (object: T) => boolean | Promise<boolean>;
    private readonly errorMessage: string;

    /**
     * Creates an instance of validation condition.
     * @param condition 
     * @param errorMessage 
     */
    constructor(condition: (object: T) => boolean | Promise<boolean>, errorMessage: string) {
        this.condition = condition;
        this.errorMessage = errorMessage;
    }

    /**
     * Validates async
     * @param object 
     * @returns async 
     */
    public async validateAsync(object: T): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (await this.condition(object)) {
                resolve(true);
            }
    
            reject(new ValidationException(this.errorMessage));
        });
    }
}
