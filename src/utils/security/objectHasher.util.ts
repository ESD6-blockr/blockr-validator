import { logger } from "@blockr/blockr-logger";
import { createHash } from "crypto";
import { injectable } from "inversify";

@injectable()
export class ObjectHasher {
    public hashAsync<T>(object: T | undefined): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                logger.info(`Hashing object: ${object}`);

                resolve(createHash("md5").update(JSON.stringify(object)).digest("hex"));
            } catch (error) {
                logger.error(error.message);

                reject(error);
            }
        });
    }
}
