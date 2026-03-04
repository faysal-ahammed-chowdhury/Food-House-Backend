import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller()
export class AdminController {
    constructor(private readonly adminService: AdminService) {
        this.adminService = adminService;
    }

    @Get('admins')
    getAdmins(): Array<object> {
        return this.adminService.getAdmins();
    }
}
