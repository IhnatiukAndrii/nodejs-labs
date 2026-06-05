export * from './delay';
export * from './fetchUserProfiles';
export * from './retryOperation';
export * from './processInBatches';

import { delay } from './delay';
import { fetchUserProfiles } from './fetchUserProfiles';
import { retryOperation } from './retryOperation';
import { processInBatches } from './processInBatches';

if (require.main === module) {
    (async () => {
        console.log('=== Запуск прикладу виконання ===');
        try {
            console.log('\n--- Тестування функції delay ---');
            await delay(1000);

            console.log('\n--- Тестування функції fetchUserProfiles ---');
            const profiles = await fetchUserProfiles(['1', '2', '3']);
            console.log('Отримані профілі:', profiles);

            console.log('\n--- Тестування функції retryOperation ---');
            let attempts = 0;
            const unreliableOperation = async (): Promise<string> => {
                attempts++;
                if (attempts < 3) {
                    throw new Error('Тимчасова помилка');
                }
                return 'Успіх!';
            };
            const result = await retryOperation(unreliableOperation, 3);
            console.log('Результат retryOperation:', result);

            console.log('\n--- Тестування функції processInBatches ---');
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
            const processor = async (batch: number[]): Promise<number[]> => {
                await delay(100);
                return batch.map(n => n * 2);
            };
            const results = await processInBatches(numbers, 3, processor);
            console.log('Результат processInBatches:', results);

            console.log('\n=== Запуск прикладу завершено успішно ===');
        } catch (error) {
            console.error('Помилка виконання прикладу:', error);
        }
    })();
}