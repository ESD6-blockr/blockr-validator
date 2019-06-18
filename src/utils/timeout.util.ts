/**
 * Creates awaitable timeout
 * @template T 
 * @param implementation 
 * @param timeoutInMs 
 * @returns awaitable timeout 
 */
export async function createAwaitableTimeout<T>(implementation: () => Promise<T>, timeoutInMs: number): Promise<T> {
    return new Promise((resolve) => {
        setTimeout(async () => {
            resolve(await implementation());
        }, timeoutInMs);
    });
}
