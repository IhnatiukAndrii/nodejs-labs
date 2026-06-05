import { fetchUserProfiles } from './fetchUserProfiles';

describe('fetchUserProfiles', () => {
    it('should return an empty array if userIds is empty', async () => {
        const result = await fetchUserProfiles([]);
        expect(result).toEqual([]);
    });

    it('should return correctly mapped user profiles', async () => {
        const ids = ['1', '2', '3'];
        const result = await fetchUserProfiles(ids);
        expect(result).toHaveLength(3);
        expect(result).toEqual([
            { id: '1', name: 'User 1', email: 'user1@example.com' },
            { id: '2', name: 'User 2', email: 'user2@example.com' },
            { id: '3', name: 'User 3', email: 'user3@example.com' }
        ]);
    });

    it('should fetch profiles in parallel', async () => {
        const ids = ['1', '2', '3'];
        const start = Date.now();
        await fetchUserProfiles(ids);
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(400);
    });
});
