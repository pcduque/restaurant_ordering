import { Injectable } from '@nestjs/common';
import { MenuRepository } from './menu.repository';

@Injectable()
export class MenuService {
  constructor(private readonly menuRepository: MenuRepository) {}

  getMenu() {
    return this.menuRepository.findAll();
  }
}
