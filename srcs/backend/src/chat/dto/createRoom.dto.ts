import { RoomEntity } from "../entities/room.entity";
import { RoomType } from "../models/typeRoom.model";
import { Matches, MinLength, IsNotEmpty, Length, MaxLength, IsString, IsOptional } from "class-validator"

export class CreateRoomDto {

    @IsNotEmpty()
    @Length(3, 20)
    @Matches('^[a-zA-Z0-9]*$')
    name: string;

    @IsOptional()
    @IsString()
    name2: string;

    @IsNotEmpty()
    @MaxLength(30)
    @Matches('^[a-zA-Z0-9 ]*$')
    description: string;

    @IsNotEmpty()
    type: RoomType;

    @IsOptional()
    @MinLength(8)
    password: string;

    constructor(name: string = "", name2: string = "", description: string = "", type: RoomType = RoomType.Public, password: string = "") {
        this.name = name;
        this.name2 = name2;
        this.description = description;
        this.type = type;
        this.password = password;
    }

    public static from(dto: Partial<CreateRoomDto>) {
        const room = new CreateRoomDto();
        room.name = dto.name;
        room.name2 = dto.name2;
        room.description = dto.description;
        room.type = dto.type;
        room.password = dto.password;
        return (room);
    }

    public static fromEntity(entity: RoomEntity) {
        const room = new CreateRoomDto();
        room.name = entity.name;
        room.name2 = entity.name2;
        room.description = entity.description;
        room.type = entity.type;
        room.password = entity.password;
        return (room);
    }

    public toEntity() {
        const room = new RoomEntity();
        room.name = this.name;
        room.name2 = this.name2;
        room.description = this.description;
        room.type = this.type;
        room.password = this.password;
        return (room);
    }
}