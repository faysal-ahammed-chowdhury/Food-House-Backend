import { Module } from "@nestjs/common";
import { RestaurantController } from "./restaurant.controller";
import { RestaurantService } from "./restaurant.service";  
import { DBModule } from "../db/db.module";


@Module({
    imports:[DBModule],
    controllers: [RestaurantController],
    providers: [RestaurantService],
})

export class RestaurantModule {}