import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from '../models';

@Injectable()
export class UsersService {
  private readonly users: Record<string, User>;

  constructor() {
    this.users = {};
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
