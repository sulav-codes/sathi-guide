import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class DeleteAccountDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Reason must not exceed 500 characters' })
  reason?: string;
}
