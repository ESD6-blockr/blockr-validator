import { KeyPairGenerationException } from "app/exceptions";
import { logger } from "app/utils";
import { generateMnemonic, mnemonicToEntropy } from "bip39";
import { injectable } from "inversify";
import { instantiate } from "js-nacl";

@injectable()
export class KeyPairGenerator {
    public generateKeyPairAsync(): Promise<{ publicKey: string, privateKey: string }> {
        return new Promise((resolve, reject) => {
            logger.info("Generating KeyPair.");

            const seed: string = generateMnemonic();
            logger.info(`[Generating KeyPair] Seed: ${seed}`);

            if (!seed) {
                reject(new KeyPairGenerationException("The generated seed is invalid."));
            }

            instantiate((nacl) => {
                const { signPk, signSk } = nacl.crypto_sign_seed_keypair(
                                           this.getUint8ArrayFromString(mnemonicToEntropy(seed)));
                const publicKey = nacl.to_hex(signPk);
                const privateKey = nacl.to_hex(signSk);

                logger.info(`[Generating KeyPair] Public Key: ${publicKey}`);
                logger.info(`[Generating KeyPair] Private Key: ${privateKey}`);

                resolve({ publicKey, privateKey });
            });
            reject();
        });
    }

    private getUint8ArrayFromString(stringToConvert: string) {
        const arrayBuffer = new ArrayBuffer(stringToConvert.length * 1);
        const newUintArray = new Uint8Array(arrayBuffer);

        newUintArray.forEach((i) => {
            newUintArray[i] = stringToConvert.charCodeAt(i);
        });
        return newUintArray;
    }
}
