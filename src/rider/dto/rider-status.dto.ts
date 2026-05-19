import { IsBoolean } from 'class-validator';

export class RiderStatusDto {
    @IsBoolean()
    isOnline!: boolean;
}