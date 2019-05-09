import { logger } from "@blockr/blockr-logger";
import * as Crypto from "crypto";
import { injectable } from "inversify";

@injectable()
export class ObjectHasher {
    public hashAsync<T>(object: T | undefined): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                logger.info(`Hashing object: ${object}`);

                resolve(Crypto.createHash("md5").update(JSON.stringify(object)).digest("hex"));
            } catch (error) {
                logger.error(error.message);

                reject(error);
            }
        });
    }
}
