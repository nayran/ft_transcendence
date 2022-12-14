import { IsDate, IsInt, IsNotEmpty } from "class-validator"

export class BanMemberDto {
    @IsNotEmpty()
    @IsInt()
    memberId: number;

    @IsInt()
    @IsNotEmpty()
    roomId: number;

    @IsNotEmpty()
    banTime: Date;
}
