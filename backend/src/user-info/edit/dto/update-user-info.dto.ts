import {
  IsOptional,
  IsString,
  IsEmail,
  Length,
  Matches,
} from 'class-validator';

export class UpdateUserInfoDto {
  @IsOptional()
  @IsString()
  @Length(4, 20)
  @Matches(/^[a-zA-Z0-9_.]+$/)
  username?: string;

  @IsOptional()
  @IsString()
  @Length(8)
  @Matches(/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])^[^\s]+$/)
  password?: string;

  @IsOptional()
  @IsEmail()
  @Matches(/^([\w.-]+)@([\w-]+)((\.(\w){2,9})+)$/)
  email?: string;

  @IsOptional()
  @IsString()
  @Length(2, 20)
  @Matches(/^[a-z ,.'-]+$/i)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 20)
  @Matches(/^[a-z ,.'-]+$/i)
  lastName?: string;
}
