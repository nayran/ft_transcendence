import { Matches, MinLength, IsNotEmpty, Length, MaxLength, IsOptional, IsInt, IsBoolean, IsString, IsIn } from "class-validator"

export class ChangeSettingRoomDto {

    @IsNotEmpty()
    @IsInt()
    roomId: number;

    @IsOptional()
    @Length(3, 20)
    @Matches('^[a-zA-Z0-9]*$')
    name: string;

    @IsOptional()
    @MaxLength(30)
    @Matches('^[a-zA-Z0-9 ]*$')
    description: string;

    @IsOptional()
    @MinLength(8)
    password: string;

    @IsOptional()
    @IsString()
    radioPassword: string;
}