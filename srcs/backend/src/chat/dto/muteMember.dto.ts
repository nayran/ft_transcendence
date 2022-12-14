import { IsNotEmpty, IsInt } from "class-validator"

export class MuteMemberDto {
    @IsNotEmpty()
    @IsInt()
    memberId: number;

    @IsNotEmpty()
    @IsInt()
    roomId: number;

    @IsNotEmpty()
    muteTime: Date;
}
