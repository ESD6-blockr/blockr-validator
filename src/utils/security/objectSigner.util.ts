import { createSign } from "crypto";
import { injectable } from "inversify";
import { logger } from "../";

const PRIVATE_KEY: string = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : "";

@injectable()
export class ObjectSigner {
    public async signAsync<T>(object: T): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const signer = createSign("sha256");
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
