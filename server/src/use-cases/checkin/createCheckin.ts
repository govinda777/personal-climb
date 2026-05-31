import { CheckinRepository } from '../../repositories/checkinRepository';

interface CreateCheckinInput {
  athleteId: string;
  slotId: string;
}

export class CreateCheckinUseCase {
  async execute({ athleteId, slotId }: CreateCheckinInput) {
    const repo = new CheckinRepository();
    const existing = await repo.findExistingCheckin(athleteId, slotId);
    if (existing) throw new Error('User already checked in for this slot');
    await repo.insertCheckin(athleteId, slotId);
  }
}
