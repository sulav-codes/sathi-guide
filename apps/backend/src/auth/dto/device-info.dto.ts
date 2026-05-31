import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class DeviceInfoDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceName?: string;

  @IsIn(['android', 'ios', 'web'], {
    message: 'platform must be one of: android, ios, web',
  })
  platform!: 'android' | 'ios' | 'web';

  @IsOptional()
  @IsString()
  @MaxLength(512)
  fcmToken?: string;
}
