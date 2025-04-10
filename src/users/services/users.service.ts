import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async createOne({ email, password }: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create({
      email,
      password,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return this.userRepository.save(newUser);
  }
}
