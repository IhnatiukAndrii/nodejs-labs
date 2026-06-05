import { delay } from './delay';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
}

export async function fetchUserProfiles(userIds: string[]): Promise<UserProfile[]> {
    try {
        console.log(`[fetchUserProfiles] Start: fetching profiles for userIds [${userIds.join(', ')}]`);
        
        if (userIds.length === 0) {
            console.log('[fetchUserProfiles] Success: userIds is empty, returning empty array');
            return [];
        }

        const fetchPromises = userIds.map(async (id) => {
            try {
                const randomDelay = Math.floor(Math.random() * (150 - 50 + 1)) + 50;
                console.log(`[fetchUserProfiles] Simulating fetch for User ${id} (delay: ${randomDelay}ms)`);
                
                await delay(randomDelay);
                
                const profile: UserProfile = {
                    id,
                    name: `User ${id}`,
                    email: `user${id}@example.com`
                };
                return profile;
            } catch (error) {
                console.error(`[fetchUserProfiles] Error fetching profile for User ${id}:`, error);
                throw error;
            }
        });

        const profiles = await Promise.all(fetchPromises);

        console.log(`[fetchUserProfiles] Success: loaded ${profiles.length} profiles`);
        return profiles;
    } catch (error) {
        console.error('[fetchUserProfiles] Error during fetching profiles:', error);
        throw error;
    }
}
