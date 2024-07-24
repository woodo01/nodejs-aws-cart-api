import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from '../models';

@Injectable()
export class UsersService {
  private readonly users: Record<string, User>;

  constructor() {
    this.users = {
      //   '4e180e57-19c5-47b9-87e7-0192d07ecd1e': {
      //     id: '4e180e57-19c5-47b9-87e7-0192d07ecd1e',
      //     name: 'test_user',
      //     email: 'test@test.com',
      //     password: 'secretpass',
      //   },
    };
  }

  findOne(userId: string): User {
    return this.users[userId];
  }

  createOne({ name, password }: User): User {
    const id = randomUUID();
    const newUser = { id: name || id, name, password };

    this.users[id] = newUser;

    return newUser;
  }
}
