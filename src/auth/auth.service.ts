import 'reflect-metadata';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from "../users";
import { User } from '../entities/user.entity';
// import { contentSecurityPolicy } from 'helmet';
type TokenResponse = {
  token_type: string;
  access_token: string;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    this.loginJWT = this.loginJWT.bind(this);
    this.loginBasic = this.loginBasic.bind(this);
  }

  async register(payload: User) {
    if (!this.usersService) {
      throw new Error('UsersService not initialized');
    }

    const user = await this.usersService.findOne(payload.email);

    if (user) {
      throw new BadRequestException('User with such name already exists');
    }

    const { id: userId } = await this.usersService.createOne(payload);
    return { userId };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOne(email);

    if (user) {
      return user;
    }

    return null;
  }

  async login(
    user: User,
    type: 'jwt' | 'basic' | 'default',
  ): Promise<TokenResponse> {
    const LOGIN_MAP = {
      jwt: this.loginJWT,
      basic: this.loginBasic,
      default: this.loginJWT,
    };
    const login = LOGIN_MAP[type];

    return login ? login(user) : LOGIN_MAP.default(user);
  }

  loginJWT(user: User) {
    const payload = { username: user.email, sub: user.id };

    return {
      token_type: 'Bearer',
      access_token: this.jwtService.sign(payload),
    };
  }

  loginBasic(user: User) {
    // const payload = { username: user.name, sub: user.id };
    console.log(user);

    function encodeUserToken(user: User) {
      const { email, password } = user;
      const buf = Buffer.from([email, password].join(':'), 'utf8');

      return buf.toString('base64');
    }

    return {
      token_type: 'Basic',
      access_token: encodeUserToken(user),
    };
  }
}
