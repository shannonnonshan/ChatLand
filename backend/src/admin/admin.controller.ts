import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get(':id')
  async getAdminDashboard(@Param('id') id: string) {
    const dashboard = await this.adminService.getDashboard(+id);
    if (!dashboard) {
      throw new NotFoundException('Admin not found or not authorized');
    }
    return dashboard;
  }
}
