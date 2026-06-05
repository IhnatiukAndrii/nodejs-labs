import { Router } from 'express';
import { entityStorage } from '../storage/entity';
import { createSchema, updateSchema, EntityFilters } from '../schemas/entity.schema';
import { validate } from '../middleware';

const router = Router();

router.get('/', async (req, res, next) => {
    try {
        const { priority, maxPrice, name, sort, page, limit } = req.query;
        const filters: EntityFilters = {};
        if (typeof priority === 'string' && ['low', 'medium', 'high'].includes(priority)) {
            filters.priority = priority as 'low' | 'medium' | 'high';
        }
        if (typeof maxPrice === 'string' && !isNaN(Number(maxPrice))) {
            filters.maxPrice = Number(maxPrice);
        }
        if (typeof name === 'string') {
            filters.name = name;
        }

        const sortStr = typeof sort === 'string' ? sort : undefined;
        const pageNum = typeof page === 'string' && !isNaN(Number(page)) ? Math.max(1, parseInt(page, 10)) : undefined;
        const limitNum = typeof limit === 'string' && !isNaN(Number(limit)) ? Math.max(1, parseInt(limit, 10)) : undefined;

        const result = await entityStorage.findAll({
            filters,
            sort: sortStr,
            page: pageNum,
            limit: limitNum
        });
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/expensive', async (req, res, next) => {
    try {
        const items = await entityStorage.findExpensive();
        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const item = await entityStorage.findById(req.params.id as string);
        if (!item) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }
        res.status(200).json(item);
    } catch (error) {
        next(error);
    }
});

router.post('/', validate(createSchema), async (req, res, next) => {
    try {
        const newItem = await entityStorage.create(req.body);
        res.status(201).json(newItem);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', validate(updateSchema), async (req, res, next) => {
    try {
        const updated = await entityStorage.update(req.params.id as string, req.body);
        if (!updated) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }
        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const success = await entityStorage.delete(req.params.id as string);
        if (!success) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

export default router;
