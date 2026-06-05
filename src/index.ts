import { delay } from './delay';

(async () => {
    console.log('=== Запуск прикладу виконання ===');
    try {
        await delay(1000);
        console.log('=== Запуск прикладу завершено успішно ===');
    } catch (error) {
        console.error('Помилка виконання прикладу:', error);
    }
})();