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
import { AcceptDeliveryDto } from "./dto/accept-delivery.dto";
import { UpdateDeliveryDto } from "./dto/update-delivery.dto";


@Controller("rider")
export class RiderController{
    constructor(private readonly riderService: RiderService) {}


       //1.get rider by id
        @Get('riders/:id')
        async getRiderById(@Param('id', ParseIntPipe) riderId: number): Promise<object> {
            return this.riderService.getRiderById(riderId);
         }


        //2. rider profile update without image

        @Put("riders/:id")
        @UsePipes(new ValidationPipe())
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


/// checking pass--
      @Post('riders/check-password')
    async checkPassword(
      @Body()
      body: {
        riderId: number;
        password: string;
      },
    ) {
      return await this.riderService.checkPassword(
        body.riderId,
        body.password,
      );
  }

  // change pass--
  @Patch('riders/change-password/:riderId')
    async changePassword(
      @Param('riderId', ParseIntPipe) riderId: number,

      @Body()
      body: {
        newPassword: string;
      },
    ) {
      return await this.riderService.changePassword(
        riderId,
        body.newPassword,
      );
    }

  //available request
  @Get('available')
  getAvailable() {
    return this.riderService.getAvailableRequests();
  }

   //  Accept request
  

  @Post('accept')
  acceptDelivery(@Body() dto: AcceptDeliveryDto) {
      return this.riderService.acceptDelivery(dto);
  }
 

  // Picked
  @Post('picked')
  picked(@Body() dto: UpdateDeliveryDto) {
    return this.riderService.markPicked(dto);
  }

  //  picked theke Delivered
  @Post('delivered')
  delivered(@Body() dto: UpdateDeliveryDto) {
    return this.riderService.markDelivered(dto);
  }

  //  My deliveries
  @Get('my/:riderId')
  my(@Param('riderId') riderId: number) {
    return this.riderService.myDeliveries(riderId);
  }
/// sb running orders- delivery kora baki
  @Get(':riderId/running-orders')
  getRunningOrders(
      @Param('riderId', ParseIntPipe) riderId: number,) {
        return this.riderService.getRunningOrdersByRider(riderId);
    }
//delivered
  @Get(':riderId/delivered-orders')
  getDeliveredOrders(
      @Param('riderId', ParseIntPipe) riderId: number,) {
        return this.riderService.getDeliveredOrdersByRider(riderId);
      }

}