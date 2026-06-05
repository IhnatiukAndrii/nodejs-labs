import { retryOperation } from './retryOperation';

describe('retryOperation', () => {
    it('should resolve immediately if operation succeeds first time', async () => {
        const operation = jest.fn().mockResolvedValue('success');
        const result = await retryOperation(operation, 3);
        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and resolve when successful', async () => {
        let attempts = 0;
        const operation = jest.fn().mockImplementation(async () => {
            attempts++;
            if (attempts < 3) {
                throw new Error('temporary error');
            }
            return 'success';
        });
        const result = await retryOperation(operation, 3);
        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw the last error if all attempts fail', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('fatal error'));
        await expect(retryOperation(operation, 3)).rejects.toThrow('fatal error');
        expect(operation).toHaveBeenCalledTimes(3);
    });
});
