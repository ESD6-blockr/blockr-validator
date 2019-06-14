export async function createAwaitableTimeout<T>(implementation: () => Promise<T>, timeoutInMs: number): Promise<T> {
    return new Promise((resolve) => {
        setTimeout(async () => {
            resolve(await implementation());
        }, timeoutInMs);
    });
}
