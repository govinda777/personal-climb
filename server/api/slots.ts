import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { GetSlotsUseCase } from '../src/use-cases/slots/getSlots';
import { CreateSlotUseCase } from '../src/use-cases/slots/createSlot';
import { UpdateSlotUseCase } from '../src/use-cases/slots/updateSlot';
import { DeleteSlotUseCase } from '../src/use-cases/slots/deleteSlot';

const app = new Hono();

// Schemas for validation
const getSlotsQuerySchema = z.object({
  personalId: z.string().uuid(),
});

const slotBodySchema = z.object({
  personalId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  maxCapacity: z.number().int().positive().default(1),
  location: z.string().optional(),
});

const slotUpdateSchema = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  maxCapacity: z.number().int().positive().optional(),
  location: z.string().optional(),
});

app.get('/', zValidator('query', getSlotsQuerySchema), async (c) => {
  const { personalId } = c.req.valid('query');

  try {
    const useCase = new GetSlotsUseCase();
    const slots = await useCase.execute(personalId);

    return c.json({ status: 'success', data: slots });
  } catch (error: any) {
    console.error('Fetch slots error:', error);
    return c.json({ status: 'error', message: 'Internal server error' }, 500);
  }
});

app.post('/', zValidator('json', slotBodySchema), async (c) => {
  const body = c.req.valid('json');

  try {
    const useCase = new CreateSlotUseCase();
    const createdSlot = await useCase.execute(body);

    return c.json({ status: 'success', data: createdSlot });
  } catch (error: any) {
    console.error('Create slot error:', error);
    return c.json({ status: 'error', message: 'Failed to create slot due to conflict or error' }, 409);
  }
});

app.put('/:id', zValidator('json', slotUpdateSchema), async (c) => {
  const id = c.req.param('id');
  const body = c.req.valid('json');

  try {
    const useCase = new UpdateSlotUseCase();
    const updatedSlot = await useCase.execute({ id, ...body });

    if (!updatedSlot) {
      return c.json({ status: 'error', message: 'Slot not found' }, 404);
    }

    return c.json({ status: 'success', data: updatedSlot });
  } catch (error: any) {
    console.error('Update slot error:', error);
    if (error.message === 'No fields to update') {
      return c.json({ status: 'error', message: error.message }, 400);
    }
    return c.json({ status: 'error', message: 'Failed to update slot due to conflict or error' }, 409);
  }
});

app.delete('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const useCase = new DeleteSlotUseCase();
    const deletedSlot = await useCase.execute(id);

    if (!deletedSlot) {
      return c.json({ status: 'error', message: 'Slot not found' }, 404);
    }

    return c.json({ status: 'success', data: deletedSlot });
  } catch (error: any) {
    console.error('Delete slot error:', error);
    return c.json({ status: 'error', message: 'Internal server error' }, 500);
  }
});

export default app;
