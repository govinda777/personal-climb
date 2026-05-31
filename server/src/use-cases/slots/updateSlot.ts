import { SlotsRepository } from '../../repositories/slotsRepository';

interface UpdateSlotInput {
  id: string;
  startTime?: string;
  endTime?: string;
  maxCapacity?: number;
  location?: string;
}

export class UpdateSlotUseCase {
  async execute(data: UpdateSlotInput) {
    const { id, ...body } = data;
    if (Object.keys(body).length === 0) throw new Error('No fields to update');

    const repo = new SlotsRepository();
    return await repo.updateSlot(id, body);
  }
}
