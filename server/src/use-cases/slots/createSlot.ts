import { SlotsRepository } from '../../repositories/slotsRepository';

interface CreateSlotInput {
  personalId: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  location?: string;
}

export class CreateSlotUseCase {
  async execute(data: CreateSlotInput) {
    const repo = new SlotsRepository();
    return await repo.createSlot(data);
  }
}
