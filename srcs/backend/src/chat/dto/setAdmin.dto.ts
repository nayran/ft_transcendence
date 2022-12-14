import { IsNotEmpty, IsInt } from "class-validator"

export class SetAdminDto {
    @IsNotEmpty()
    @IsInt()
    userId: number

    @IsNotEmpty()
    @IsInt()
    roomId: number
}
