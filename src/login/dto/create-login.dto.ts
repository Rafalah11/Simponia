import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLoginDto {
  @IsNotEmpty()
  @IsString()
  nim: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  rememberMe?: boolean;
}
