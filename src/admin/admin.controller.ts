import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AdminService } from './admin.service';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateRiderDto } from './dto/update-rider.dto';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {
        this.adminService = adminService;
    }

    /* Manage Restaurant */

    /* Manage Rider */

    // create rider route
    @Post('create-rider')
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseInterceptors(
        FileInterceptor('nid_img', {
            fileFilter: function (req, file, callback) {
                if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
                    return callback(
                        new BadRequestException('Only image files allowed!'),
                        false,
                    );
                }

                callback(null, true); // okay
            },
            limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
            storage: diskStorage({
                // destination: './uploads',
                // filename(req, file, callback) {
                //     callback(null, Date.now() + file.originalname);
                // },
            }),
        }),
    )
    createRider(@Body() createRiderDto: CreateRiderDto): object {
        return this.adminService.createRider(createRiderDto);
    }

    // get all rider route
    @Get('get-all-rider')
    getAllRider(): object {
        return this.adminService.getAllRider();
    }

    // update rider route
    @Put('update-rider/:id')
    @UsePipes(new ValidationPipe())
    updateRider(
        @Param('id', ParseIntPipe) riderId: number,
        @Body() updateRiderDto: UpdateRiderDto,
    ): object {
        return this.adminService.updateRider(riderId, updateRiderDto);
    }

    // delete rider route
    @Delete('delete-rider/:id')
    deleteRider(@Param('id') riderId: string): object {
        return this.adminService.deleteRider(riderId);
    }
}
