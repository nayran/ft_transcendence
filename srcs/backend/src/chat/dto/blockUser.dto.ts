import { IsInt, IsNotEmpty } from "class-validator"

export class BlockUserDto {
    @IsNotEmpty()
    @IsInt()
    blockedUserId: number;
}
