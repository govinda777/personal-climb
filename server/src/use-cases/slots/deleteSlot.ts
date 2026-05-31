import { SlotsRepository } from '../../repositories/slotsRepository';

export class DeleteSlotUseCase {
  async execute(id: string) {
    const repo = new SlotsRepository();
    return await repo.deleteSlot(id);
  }
}
