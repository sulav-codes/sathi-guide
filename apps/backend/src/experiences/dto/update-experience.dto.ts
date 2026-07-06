import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateExperienceDto } from './create-experience.dto';

export class UpdateExperienceDto extends PartialType(
  OmitType(CreateExperienceDto, [
    'slug',
    'pricingRules',
    'location',
    'meetingLocation',
  ] as const),
) {
  // These fields require separate endpoints for updates
}
