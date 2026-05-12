import { Controller, Get, Param, Query, Post, Body, Put, Patch, Delete, UsePipes,  UseInterceptors, UploadedFile, ValidationPipe, ParseIntPipe, UseGuards, BadRequestException, Res} from "@nestjs/common";
import type { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express"; 
import { MulterError, diskStorage } from "multer";
import { RiderService } from "./rider.service";
import {UpdateRiderDto} from "./dto/update-rider.dto";
import {RiderStatusDto} from "./dto/rider-status.dto";
import {ChangePasswordDto} from "./dto/change-password.dto";


import { AuthGuard } from "../auth/auth.guard";
import { get } from "http";


@Controller("rider")
export class RiderController{
    constructor(private readonly riderService: RiderService) {}


       //1.get rider by id
        @Get('riders/:id')
        async getRiderById(@Param('id', ParseIntPipe) riderId: number): Promise<object> {
            return this.riderService.getRiderById(riderId);
         }

         /*//2.Update rider--
        @Put("riders/:id")
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
        async updateRider(
            @Param('id', ParseIntPipe) riderId: number,
            @Body() updateRiderDto: UpdateRiderDto,
            @UploadedFile() file?: Express.Multer.File,
        ): Promise<object> {
            let nidImageUrl: string | undefined = undefined;
            if (file) {
                nidImageUrl = `${file.filename}`;
            }
            return this.riderService.updateRider(riderId, updateRiderDto, nidImageUrl);
        }*/


        //2. rider profile update without image
        @Put("riders/:id")
        async updateRider(
            @Param('id', ParseIntPipe) riderId: number,
            @Body() updateRiderDto: UpdateRiderDto,
        ): Promise<object> {
            return this.riderService.updateRider(riderId, updateRiderDto);
         }

        //3. get image by id
       @Get('/getimage/:name')
    getImages(@Param('name') name: string, @Res() res: Response) {
        res.sendFile(name,{ root: './uploads' })
    }

    

    //4. dashboard data
    @Get('riders/:id/dashboard')
    async getDashboardData(
        @Param('id', ParseIntPipe) riderId: number,
    ): Promise<object> {
        return this.riderService.getDashboardData(riderId);
    }

    // 5. status update
    
    @Patch("riders/:id/status")
    async updateStatus(
        @Param("id", ParseIntPipe) riderId: number,
        @Body() dto: RiderStatusDto
    ) {
        return this.riderService.updateRiderStatus(riderId, dto);
    }

        // 6.change password-

    /*
    

*/
   
}
