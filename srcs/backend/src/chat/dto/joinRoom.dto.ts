import { IsNotEmpty, IsOptional, IsInt } from "class-validator"

export class JoinRoomDto {
    @IsNotEmpty()
    @IsInt()
    roomId: number;

    @IsOptional()
    @IsInt()
    userId: number;
}