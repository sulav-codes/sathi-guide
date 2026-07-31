import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Minimal DTO for creating a Draft experience at the end of Step 1.
 * Only the fields the user has entered so far are required.
 * Everything else (location, pricing, images) is provided via PATCH.
 */
export class CreateDraftExperienceDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsString()
  @IsNotEmpty()
  shortDescription!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
