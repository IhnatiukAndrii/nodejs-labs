import { WishlistItem } from '../models/entity.model';
import { Entity, EntityFilters } from '../schemas/entity.schema';

export const entityStorage = {
    async findAll(filters?: EntityFilters): Promise<any[]> {
        const query: any = {};
        if (filters) {
            if (filters.priority) {
                query.priority = filters.priority;
            }
            if (filters.maxPrice !== undefined) {
                query.price = { $lte: filters.maxPrice };
            }
            if (filters.name) {
                query.name = { $regex: filters.name, $options: 'i' };
            }
        }
        return WishlistItem.find(query);
    },

    async findById(id: string): Promise<any | null> {
        return WishlistItem.findById(id);
    },

    async create(item: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>): Promise<any> {
        return WishlistItem.create(item);
    },

    async update(id: string, item: Partial<Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<any | null> {
        return WishlistItem.findByIdAndUpdate(id, item, {
            new: true,
            runValidators: true
        });
    },

    async delete(id: string): Promise<boolean> {
        const result = await WishlistItem.findByIdAndDelete(id);
        return result !== null;
    }
};
