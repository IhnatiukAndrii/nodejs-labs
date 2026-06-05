export async function raceWithTimeout(
    promise: Promise<unknown>,
    timeoutMs: number
): Promise<unknown> {
    let timer: NodeJS.Timeout | undefined;
    try {
        console.log(`[raceWithTimeout] Start: setting timeout limit of ${timeoutMs}ms`);

        const timeoutPromise = new Promise<never>((_, reject) => {
            timer = setTimeout(() => {
                reject(new Error(`Operation timed out after ${timeoutMs}ms`));
            }, timeoutMs);
        });

        const result = await Promise.race([promise, timeoutPromise]);
        console.log('[raceWithTimeout] Success: operation completed before timeout');
        return result;
    } catch (error) {
        console.error('[raceWithTimeout] Error/Timeout:', error);
        throw error;
    } finally {
        if (timer) {
            clearTimeout(timer);
        }
    }
}
