export async function processInBatches<T, U>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<U[]>
): Promise<U[]> {
    try {
        const results: U[] = [];
        const total = Math.ceil(items.length / batchSize);

        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const n = Math.floor(i / batchSize) + 1;
            console.log(`Обробка партії ${n}/${total}...`);
            const processedBatch = await processor(batch);
            results.push(...processedBatch);
        }

        return results;
    } catch (error) {
        console.error('[processInBatches] Error processing batches:', error);
        throw error;
    }
}
