import { randomUUID } from 'crypto';
import { Entity, EntityFilters } from '../schemas/entity.schema';

const storage = new Map<string, Entity>();

export const entityStorage = {
    findAll(filters?: EntityFilters): Entity[] {
        let results = Array.from(storage.values());
        if (!filters) {
            return results;
        }
        if (filters.priority) {
            results = results.filter(item => item.priority === filters.priority);
        }
        if (filters.maxPrice !== undefined) {
            results = results.filter(item => item.price <= filters.maxPrice!);
        }
        if (filters.name) {
            const search = filters.name.toLowerCase();
            results = results.filter(item => item.name.toLowerCase().includes(search));
        }
        return results;
    },

    findById(id: string): Entity | undefined {
        return storage.get(id);
    },

    create(item: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>): Entity {
        const id = randomUUID();
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
