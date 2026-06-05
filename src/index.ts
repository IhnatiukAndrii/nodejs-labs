export * from './delay';
export * from './fetchUserProfiles';

import { delay } from './delay';
import { fetchUserProfiles } from './fetchUserProfiles';

if (require.main === module) {
    (async () => {
        console.log('=== Запуск прикладу виконання ===');
        try {
            console.log('\n--- Тестування функції delay ---');
            await delay(1000);

            console.log('\n--- Тестування функції fetchUserProfiles ---');
            const profiles = await fetchUserProfiles(['1', '2', '3']);
            console.log('Отримані профілі:', profiles);

            console.log('\n=== Запуск прикладу завершено успішно ===');
        } catch (error) {
            console.error('Помилка виконання прикладу:', error);
        }
    })();
}