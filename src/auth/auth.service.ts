import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { AuthDto } from './dto/auth.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { UsersRepository } from './users.repository';

const scrypt = promisify(scryptCallback);

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async register(dto: AuthDto) {
    const username = dto.username.trim().toLowerCase();
    const existing = await this.usersRepository.findByUsername(username);
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const passwordSalt = randomBytes(16).toString('hex');
    const passwordHash = await this.hashPassword(dto.password, passwordSalt);
    const authToken = this.createToken();

    const user = await this.usersRepository.create({
      _id: uuidv4(),
      username,
      passwordHash,
      passwordSalt,
      authToken,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.toAuthResponse(user._id, user.username, authToken);
  }

  async login(dto: AuthDto) {
    const username = dto.username.trim().toLowerCase();
    const user = await this.usersRepository.findByUsername(username);
    if (
      !user ||
      !(await this.verifyPassword(
        dto.password,
        user.passwordSalt,
        user.passwordHash,
      ))
    ) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const authToken = this.createToken();
    await this.usersRepository.updateAuthToken(user._id, authToken);
    return this.toAuthResponse(user._id, user.username, authToken);
  }

  async authenticateToken(
    authToken?: string,
  ): Promise<AuthenticatedUser | null> {
    if (!authToken) {
      return null;
    }

    const user = await this.usersRepository.findByAuthToken(authToken);
    return user ? { userId: user._id, username: user.username } : null;
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    const hash = (await scrypt(password, salt, 64)) as Buffer;
    return hash.toString('hex');
  }

  private async verifyPassword(
    password: string,
    salt: string,
    expectedHash: string,
  ): Promise<boolean> {
    const actual = Buffer.from(await this.hashPassword(password, salt), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  }

  private createToken(): string {
    return randomBytes(32).toString('hex');
  }

  private toAuthResponse(userId: string, username: string, token: string) {
    return { userId, username, token };
  }
}
