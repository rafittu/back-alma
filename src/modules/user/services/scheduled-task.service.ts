import { Injectable, Inject } from '@nestjs/common';
import * as schedule from 'node-schedule';
import { UserRepository } from '../repository/user.repository';
import { IUserRepository } from '../interfaces/repository.interface';
import { User } from '@prisma/client';

@Injectable()
export class ScheduledTaskService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository<User>,
  ) {}

  deleteCancelledUsersScheduledTask() {
    schedule.scheduleJob('0 0 * * *', async () => {
      await this.deleteCancelledUsers();
    });
  }

  async deleteCancelledUsers(): Promise<void> {
    const dateThreshold = new Date();
    const days = 21;
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const usersToDelete =
      await this.userRepository.findCancelledUsersToDelete(dateThreshold);

    for (const user of usersToDelete) {
      await this.userRepository.deleteUser(user.id);
    }
  }
}
