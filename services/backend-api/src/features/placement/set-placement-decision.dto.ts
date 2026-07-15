import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class SetPlacementDecisionDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['take_placement', 'start_from_scratch'])
  readonly decision!: 'take_placement' | 'start_from_scratch';
}
