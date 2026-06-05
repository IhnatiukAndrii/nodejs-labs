import { Entity } from '../schemas/entity.schema';

const storage = new Map<string, Entity>();

export const entityStorage = {
    findAll(): Entity[] {
        return Array.from(storage.values());
    },

    findById(id: string): Entity | undefined {
        return storage.get(id);
    },

    create(item: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>): Entity {
        const id = Math.random().toString(36).substring(2, 9);
        const now = new Date();
        const newItem: Entity = {
            ...item,
            id,
            createdAt: now,
            updatedAt: now
        };
        storage.set(id, newItem);
        return newItem;
    },

    update(id: string, item: Partial<Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>>): Entity | undefined {
        const existing = storage.get(id);
        if (!existing) {
            return undefined;
        }
        const updatedItem: Entity = {
            ...existing,
            ...item,
            updatedAt: new Date()
        };
        storage.set(id, updatedItem);
        return updatedItem;
    },

    delete(id: string): boolean {
        return storage.delete(id);
    },

    reset(): void {
        storage.clear();
    }
};
