import { SlotsRepository } from '../../repositories/slotsRepository';

export class GetSlotsUseCase {
  async execute(personalId: string) {
    const repo = new SlotsRepository();
    return await repo.getSlotsByPersonalId(personalId);
  }
}
