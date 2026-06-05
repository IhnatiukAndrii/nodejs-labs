import { delay } from './delay';

describe('delay', () => {
    it('should resolve after the specified delay', async () => {
        const start = Date.now();
        await delay(100);
        const duration = Date.now() - start;
        expect(duration).toBeGreaterThanOrEqual(95);
    });

    it('should reject if negative delay is passed', async () => {
        await expect(delay(-100)).rejects.toThrow('Delay duration cannot be negative');
    });
});
