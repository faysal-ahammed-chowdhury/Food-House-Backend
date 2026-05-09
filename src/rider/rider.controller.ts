import { Controller, Get, Param, Query, Post, Body, Put, Patch, Delete, UsePipes,  UseInterceptors, UploadedFile, ValidationPipe, ParseIntPipe, UseGuards} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express"; 
import { MulterError, diskStorage } from "multer";
import { RiderService } from "./rider.service";
import { UpdateRiderDto, CreateRiderDto, RiderStatusDto, AssignDeliveryDto,  } from './rider.dto';

import { AuthGuard } from "../auth/auth.guard";


@Controller("rider")
export class RiderController{
    constructor(private readonly riderService: RiderService) {}

    @Post('create')
    @UsePipes(new ValidationPipe())
    async createRider(@Body() createRiderDto: CreateRiderDto): Promise<object>{
        return this.riderService.createRider(createRiderDto);
    }
   
    //@UseGuards(AuthGuard, RiderGuard)
    @Get('all')
    async getAllRiders(): Promise<object> {
        return this.riderService.getAllRiders();
    }

   // @UseGuards(AuthGuard, RiderGuard)
    @Get(':id')
    async getRiderById(@Param('id', ParseIntPipe) riderId: number): Promise<object> {
        return this.riderService.getRiderById(riderId);
    }

   // @UseGuards(AuthGuard, RiderGuard)
    @Put('update/:id')
    @UsePipes(new ValidationPipe())
    async updateRider(
        @Param('id', ParseIntPipe) riderId: number,
        @Body() updateRiderDto: UpdateRiderDto
    ): Promise<object> {
        return this.riderService.updateRider(riderId, updateRiderDto);
    }

   // @UseGuards(AuthGuard, RiderGuard)
    @Patch('status/:id')
    @UsePipes(new ValidationPipe())
    async updateRiderStatus(
        @Param('id', ParseIntPipe) riderId: number,
        @Body() riderStatusDto: RiderStatusDto
    ): Promise<object> {
        return this.riderService.updateRiderStatus(riderId, riderStatusDto);
    }

   // @UseGuards(AuthGuard, RiderGuard)
    @Delete('delete/:id')
    async deleteRider(@Param('id', ParseIntPipe) riderId: number): Promise<object> {
        return this.riderService.deleteRider(riderId);
    }

    // @UseGuards(AuthGuard, RiderGuard)
    @Post('assign-delivery')
    @UsePipes(new ValidationPipe())
    async assignDelivery(@Body() assignDeliveryDto: AssignDeliveryDto): Promise<object> {
        return this.riderService.assignDelivery(assignDeliveryDto);
    }



   
}