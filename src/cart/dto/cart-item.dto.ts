import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class SelectedModifierDto {
  @ApiProperty({ example: 'protein' })
  @IsString()
  groupId: string;

  @ApiProperty({ example: ['beef'] })
  @IsArray()
  @IsString({ each: true })
  optionIds: string[];
}

export class CartItemDto {
  @ApiProperty({ example: 'classic-burger' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ type: [SelectedModifierDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedModifierDto)
  modifiers?: SelectedModifierDto[];
}

export class PriceCartDto {
  @ApiProperty({ type: [CartItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}
