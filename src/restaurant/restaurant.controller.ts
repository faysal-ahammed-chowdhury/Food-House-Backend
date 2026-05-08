import {  Controller, Get, Post, Patch, Put, Delete, Body, Param, Query, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, Res, BadRequestException, ParseIntPipe, UseGuards} from "@nestjs/common";
import { RestaurantService } from "./restaurant.service";
import { diskStorage, MulterError } from "multer";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from 'express';
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateItemDto } from "./dto/create-item.dto";
import { UpdateRestaurantDto } from "./dto/update-restaurant.dto";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { CreateRestaurantDto } from "./dto/create-restaurant.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { RestaurantGuard } from "./restaurant.guard";
import { AuthGuard } from "../auth/auth.guard";
//get       ++
//post      ++
//put       +
//patch     +
//delete    +
//query     +
//param     +++
//body      +++

// @UseGuards(AuthGuard, RestaurantGuard)
@Controller('restaurant')
export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService){}

    //CREATE RESTURENT   
    @Post('restaurants')
    @UsePipes(new ValidationPipe())
    async createRestaurant(@Body() createRestaurantDto: CreateRestaurantDto,): Promise<object> {
        return this.restaurantService.createRestaurant(createRestaurantDto);
    }

    //1. GET RESTURENT BY ID
    @Get('restaurants/:id')
    async getRestaurantById(@Param('id', ParseIntPipe) userId: number):Promise<object> {
        return this.restaurantService.getRestaurantById(userId);
    }

    //2. UPDATE RESTURENT
    @Put('restaurants/:id')
    @UseInterceptors(FileInterceptor('myfile', {
        fileFilter: (req, file, cb) => {
            if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/))
                cb(null, true);
            else {
                cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
            }
        },
        limits: { fileSize: 2097152 }, // 2MB
        storage: diskStorage({
            destination: './uploads',
            filename: function (req, file, cb) {
                cb(null, Date.now() + file.originalname)
            },
        })
    }))
    @UsePipes(new ValidationPipe())
    async updateRestaurant(
        @Param('id', ParseIntPipe) resturantId: number,
        @Body() UpdateRestaurantDto: UpdateRestaurantDto,
        @UploadedFile() file?: Express.Multer.File,
    ):Promise<object> {
        let bannerUrl: string | undefined = undefined;

        if(file) {
            bannerUrl = `${file.filename}`;
        }

        return this.restaurantService.updateRestaurant(resturantId, UpdateRestaurantDto, bannerUrl);
    }

    //3. GET RESTURENT IMAGE
    @Get('/getimage/:name')
    getImages(@Param('name') name: string, @Res() res: Response) {
        res.sendFile(name,{ root: './uploads' })
    }

    //4. UPDATE RESTURENT STATUS
    @Patch('updateStatus/:id/:status')
    async updateOpenStatus(
        @Param('id', ParseIntPipe) resturantId: number,
        @Param('status') status: string,
    ):Promise<object> {
        const isOpen = status === 'open';
        return this.restaurantService.updateRestaurantStatus(resturantId, { isOpen } as UpdateRestaurantDto);
    }


    //5. Email exist check
    @Get('checkEmail')
    async checkEmailExist(@Query('email') email: string): Promise<{ exists: boolean }> {
        const exists = await this.restaurantService.checkUserExist(email);
        if(exists) {
            return { exists: true };
        }
        return { exists: false };
    }


    //6. MATCH RESTURENT PASSWORD
    @Post('matchPassword')
    async checkPasswordMatch(@Body() Data: { restaurantId: number; password: string }): Promise<{ match: boolean }> {
        const { restaurantId, password } = Data;
        const match = await this.restaurantService.checkPasswordMatch(restaurantId, password);
        return { match };
    }


    //CREATE VOUCHER
    @Post('voucher')
    @UsePipes(new ValidationPipe())
    async createVoucher(@Body() createVoucherDto: CreateVoucherDto): Promise<object> {
        return this.restaurantService.createVoucher(createVoucherDto);
    }

    //GET VOUCHERS BY RESTURENT ID
    @Get('voucher/:id')
    async getVouchersByRestaurant(@Param('id', ParseIntPipe) id: string,): Promise<object> {
        return this.restaurantService.getVouchersByRestaurant(+id);
    }

    //DELETE VOUCHER
    @Delete('voucher/:id')
    async deleteVoucher(@Param('id') id: string): Promise<object> {
        return this.restaurantService.deleteVoucher(+id);
    }  


    //get restureant id from user id
    @Get('getRestaurantIdbyuserID/:userId')
    async getRestaurantIdByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<{ restaurantId: number | null }> {
        const restaurant = await this.restaurantService.getRestaurantByUserId(userId);
        return { restaurantId: restaurant ? restaurant.restaurantId : null };
    }

    













 
    //CREATE CATEGORY
    // @UseGuards(AuthGuard, RestaurantGuard)
    // @Post('restaurants/category')
    // @UsePipes(new ValidationPipe())
    // createCategory(@Body() createCategoryDto: CreateCategoryDto):Promise<object> {
    //     return this.restaurantService.createCategory(createCategoryDto);
    // }       

    //GET CATEGORIES BY RESTURENT ID WITH ITEMS
    @Get('restaurantcategories/:id')
    async getCategoriesByRestaurant(@Param('id', ParseIntPipe) restaurantId: number): Promise<object> {
        return this.restaurantService.getCategoriesByRestaurantId(restaurantId);
    }

    //UPDATE CATEGORY BY RESTURENT ID ans CATEGORY ID
    @Patch('category/:restaurantId/:categoryId')
    @UsePipes(new ValidationPipe())
    async updateCategoryByRestaurant(
        @Param('restaurantId', ParseIntPipe) restaurantId: number,
        @Param('categoryId', ParseIntPipe) categoryId: number,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.restaurantService.updateCategoryByRestaurant(restaurantId,categoryId,updateCategoryDto,
        );
    }

    //DELETE CATEGORY BY RESTURENT ID ans CATEGORY ID
    @Delete('category/:restaurantId/:categoryId')
    async deleteCategoryByRestaurant(
        @Param('restaurantId', ParseIntPipe) restaurantId: number,
        @Param('categoryId', ParseIntPipe) categoryId: number,
    ) {
        return this.restaurantService.deleteCategoryByRestaurant(restaurantId,categoryId,);
    }



    // @Post('items')
    // @UsePipes(new ValidationPipe({transform: true}))
    // @UseInterceptors(
    //     FileInterceptor('image', {
    //     fileFilter: (req, file, cb) => {
    //         if (file.originalname.match(/^.*\.(jpg|jpeg|png)$/)) {
    //         cb(null, true);
    //         } else {
    //         cb(new BadRequestException('Only JPG, JPEG, PNG allowed'), false);
    //         }
    //     },
    //     limits: { fileSize: 2 * 1024 * 1024 },
    //     storage: diskStorage({
    //         destination: './uploads',
    //         filename: (req, file, cb) => {
    //         const filename = `${Date.now()}-${file.originalname}`;
    //         cb(null, filename);
    //         },
    //     }),
    //     }),
    // )
    // async createItem(
    //     @UploadedFile() file: Express.Multer.File,
    //     @Body() createItemDto: CreateItemDto,
    // ) {
    //     let imageUrl: string = '';

    //     if (file) {
    //         imageUrl = `/${file.filename}`;
    //     }
    //     return this.restaurantService.create(createItemDto, imageUrl);
    // }

    

      

    

}