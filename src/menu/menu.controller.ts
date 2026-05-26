import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { MenuService } from './menu.service';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOkResponse({ description: 'Returns the seeded menu products.' })
  getMenu() {
    return this.menuService.getMenu();
  }

  @Get(':productId')
  @ApiOkResponse({ description: 'Returns one menu product.' })
  getProduct(@Param('productId') productId: string) {
    return this.menuService.getProduct(productId);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Creates a menu product.' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.menuService.createProduct(dto);
  }

  @Patch(':productId')
  @ApiOkResponse({ description: 'Updates a menu product.' })
  updateProduct(@Param('productId') productId: string, @Body() dto: UpdateProductDto) {
    return this.menuService.updateProduct(productId, dto);
  }

  @Delete(':productId')
  @ApiOkResponse({ description: 'Deletes a menu product.' })
  deleteProduct(@Param('productId') productId: string) {
    return this.menuService.deleteProduct(productId);
  }
}
