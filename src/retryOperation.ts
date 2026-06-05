import { delay } from './delay';

export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Спроба ${attempt}...`);
            return await operation();
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                await delay(100);
            }
        }
    }
    throw lastError;
}
