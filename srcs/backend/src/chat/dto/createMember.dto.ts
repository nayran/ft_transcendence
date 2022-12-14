import { UserEntity } from "src/users/users.entity";
import { MemberEntity } from "../entities/member.entity";
import { MemberRole } from "../models/memberRole.model";

export class CreateMemberDto {
    user: UserEntity;
    socketId: string;
    role: MemberRole;

    constructor(user: UserEntity = new UserEntity(), socketId: string = "", role: MemberRole = MemberRole.Member) {
        this.user = user;
        this.socketId = socketId;
        this.role = role;
    }

    public static from(dto: Partial<CreateMemberDto>) {
        const member = new CreateMemberDto();
        member.user = dto.user;
        member.socketId = dto.socketId;
        member.role = dto.role;
        return (member);
    }

    public static fromEntity(entity: MemberEntity) {
        const member = new CreateMemberDto();
        member.user = entity.user;
        member.socketId = entity.socketId;
        member.role = entity.role;
        return (member);
    }

    public toEntity() {
        const member = new MemberEntity();
        member.user = this.user;
        member.socketId = this.socketId;
        member.role = this.role;
        return (member);
    }
}