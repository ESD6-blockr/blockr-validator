import { logger } from "app/utils";
import * as Crypto from "crypto";

const PRIVATE_KEY: string = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : "";

export class ObjectSigner {
    public async signAsync<T>(object: T): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const signer = Crypto.createSign("sha256");
                signer.update(JSON.stringify(object));
                signer.end();
        
                const signature = signer.sign(PRIVATE_KEY);
                resolve(signature.toString("hex"));
            } catch (error) {
                logger.error(error.message);

                reject(error);
            }
        });
    }
}
