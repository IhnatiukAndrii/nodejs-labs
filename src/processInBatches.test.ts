import { processInBatches } from './processInBatches';

describe('processInBatches', () => {
    it('should return empty array if items is empty', async () => {
        const processor = jest.fn().mockResolvedValue([]);
        const result = await processInBatches([], 3, processor);
        expect(result).toEqual([]);
        expect(processor).not.toHaveBeenCalled();
    });

    it('should process batches sequentially and combine results', async () => {
        const items = [1, 2, 3, 4, 5];
        const processor = jest.fn().mockImplementation(async (batch: number[]) => {
            return batch.map(n => n * 2);
        });
        const result = await processInBatches(items, 2, processor);
        expect(result).toEqual([2, 4, 6, 8, 10]);
        expect(processor).toHaveBeenCalledTimes(3);
        expect(processor).toHaveBeenNthCalledWith(1, [1, 2]);
        expect(processor).toHaveBeenNthCalledWith(2, [3, 4]);
        expect(processor).toHaveBeenNthCalledWith(3, [5]);
    });

    it('should map elements from one type to another', async () => {
        const items = ['a', 'bb', 'ccc'];
        const processor = async (batch: string[]): Promise<number[]> => {
            return batch.map(s => s.length);
        };
        const result = await processInBatches(items, 2, processor);
        expect(result).toEqual([1, 2, 3]);
    });
});
