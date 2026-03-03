import {  Controller, Get, Post, Patch, Put, Delete, Body, Param, Query, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, Res} from "@nestjs/common";
import { RestaurantService } from "./restaurant.service";
import { CreateMenuDto } from "./dto/create_menu.dto";
import { CreateMenuItemDto } from "./dto/create_menu_item.dto";
import { CreateVoucherDto } from "./dto/create_voucher.dto";
import { UpdateRestaurantProfileDto } from "./dto/update_resturant_profile.dto";
import { diskStorage, MulterError } from "multer";
import { FileInterceptor } from "@nestjs/platform-express";
import { BadRequestException } from "@nestjs/common";
//get       ++
//post      ++
//put       +
//patch     +
//delete    +
//query     +
//param     +++
//body      +++

@Controller('restaurant')
export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService){}

    @Get('getbyid/:id')
    getRestaurantById(@Param('id') id: string):object {
        return this.restaurantService.getRestaurantById(id);
    }

    @Post('menu')
    @UsePipes(new ValidationPipe())
    createMenu(@Body() createMenuDto: CreateMenuDto):object {
        return this.restaurantService.createMenu(createMenuDto);
    }       

    @Post('menu-item')
    @UsePipes(new ValidationPipe())
    createMenuItem(@Body() createMenuItemDto: CreateMenuItemDto):object {
        return this.restaurantService.createMenuItem(createMenuItemDto);
    }

    @Put('profile')
    @UsePipes(new ValidationPipe())
    updateRestaurantProfile(@Body() updateRestaurantProfileDto: UpdateRestaurantProfileDto):object {
        return this.restaurantService.updateRestaurantProfile(updateRestaurantProfileDto);
    }

    @Patch('menu-item/:id/disable')
    disableMenuItem(@Param('id') id: string):object {
        return this.restaurantService.disableMenuItem(id);
    }

    @Get('orders')
    getOrders(@Query('status') status: string):object{
        return this.restaurantService.getOrdersByStatus(status);
    }

    @Post('voucher')
    createVoucher(@Body() createVoucherDto: CreateVoucherDto):object {
        return this.restaurantService.createVoucher(createVoucherDto);
    }

    @Delete('voucher/:id')
    deleteVoucher(@Param('id') id: string):object {
        return this.restaurantService.deleteVoucher(id);
    }


    @Post('upload')
    @UsePipes(new ValidationPipe())
    @UseInterceptors (FileInterceptor('myfile',
        { fileFilter: (req, file, cb) => {
            if (file.originalname.match(/^.*\.(jpg|jpeg)$/)){
                cb(null, true);
            }
            else {
                cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
                // cb(new BadRequestException('Cant Accept'), false);
            }
        },
        limits: { fileSize: 2*1024*1024 },
        storage:diskStorage({
            destination: './uploads',
            filename: function (req, file, cb){
                cb(null,Date.now()+file.originalname)
            },
        })
    }))
    
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        // console.log(file);
        // return { success: true, 
        //     filename: file.filename,
        //     message: 'File uploaded successfully' 
        // };
    }

    @Get('/getimage/:name')
    getImages(@Param('name') name, @Res() res) {
        res.sendFile(name,{ root: './uploads' })
    }

}