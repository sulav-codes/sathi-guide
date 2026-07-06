import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateGuideProfileDto } from './create-guide-profile.dto';

export class UpdateGuideProfileDto extends PartialType(
  OmitType(CreateGuideProfileDto, ['expertise', 'location'] as const),
) {
  // expertise and location updates are handled via separate endpoints
}
