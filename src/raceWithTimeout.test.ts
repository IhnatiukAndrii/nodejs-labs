import { raceWithTimeout } from './raceWithTimeout';
import { delay } from './delay';

describe('raceWithTimeout', () => {
    it('should resolve with the promise value if resolved before timeout', async () => {
        const operation = delay(50).then(() => 'success');
        const result = await raceWithTimeout(operation, 100);
        expect(result).toBe('success');
    });

    it('should reject with a timeout error if not resolved before timeout', async () => {
        const operation = delay(200).then(() => 'success');
        await expect(raceWithTimeout(operation, 100)).rejects.toThrow('Operation timed out after 100ms');
        await operation.catch(() => {});
    });
});
