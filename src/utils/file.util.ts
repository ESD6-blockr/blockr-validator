import { access, appendFile, constants, readFile } from "fs";
import { injectable } from "inversify";

const ENCODING = "utf8";

/**
 * Injectable
 */
@injectable()
export class FileUtils {
    /**
     * Files exists async
     * @param filePath 
     * @returns exists async 
     */
    public fileExistsAsync(filePath: string): Promise<boolean> {
        return new Promise((resolve) => {
            access(filePath, constants.F_OK, (error) => {
                resolve(!error);
            });
        });
    }

    /**
     * Appends a given string to a file for the given file path.
     * This method creates the file if the file does not exist beforehand.
     * @param filePath The path of the file that should be appended.
     * @param appendance The string that should be appended to the file.
     */
    public appendStringInFileAsync(filePath: string, appendance: string): Promise<void> {
        return new Promise((resolve, reject) => {
            appendFile(filePath, appendance, (error) => {
                if (error) {
                    reject(error);
                }

                resolve();
            });
        });
    }

    /**
     * Reads a file and returns its content in the form of the given type T.
     * @param filePath The path of the file whose content should be read.
     */
    public readFileAsync<T>(filePath: string): Promise<T> {
        return new Promise((resolve, reject) => {
            readFile(filePath, ENCODING, (error, fileContents) => {
                if (error) {
                    reject(error);
                }

                resolve(JSON.parse(fileContents));
            });
        });
    }
}
