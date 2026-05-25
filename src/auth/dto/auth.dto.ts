import { IsString, MaxLength, MinLength } from 'class-validator';

export class AuthDto {
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  username: string;

  @IsString()
  @MinLength(4)
  @MaxLength(100)
  password: string;
}
