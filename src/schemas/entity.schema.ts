import { z } from 'zod';

export const createSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    price: z.number().positive(),
    priority: z.enum(['low', 'medium', 'high']),
    url: z.string().url().optional()
});

export const updateSchema = createSchema.partial();

export type Entity = z.infer<typeof createSchema> & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
};
