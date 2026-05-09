import { Module } from "@nestjs/common";
import { RiderController } from "./rider.controller";
import { RiderService } from "./rider.service";
import { DBModule } from "../db/db.module";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [DBModule, AuthModule],
    controllers: [RiderController],
    providers: [RiderService]   
})

export class RiderModule {}