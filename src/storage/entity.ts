import { WishlistItem } from '../models/entity.model';
import { Entity, EntityFilters } from '../schemas/entity.schema';

export const entityStorage = {
    async findAll(options?: {
        filters?: EntityFilters;
        sort?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }> {
        const filters = options?.filters;
        const sortStr = options?.sort;
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 10;

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

        let sortObj: any = { createdAt: -1 };
        if (sortStr) {
            const isDesc = sortStr.startsWith('-');
            const field = isDesc ? sortStr.substring(1) : sortStr;
            const allowedFields = ['price', 'name', 'createdAt', 'priority'];
            if (allowedFields.includes(field)) {
                sortObj = { [field]: isDesc ? -1 : 1 };
            }
        }

        const skip = (page - 1) * limit;

        const [total, data] = await Promise.all([
            WishlistItem.countDocuments(query),
            WishlistItem.find(query)
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    },

    async findExpensive(): Promise<any[]> {
        return WishlistItem.find({ price: { $gt: 100 } });
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
