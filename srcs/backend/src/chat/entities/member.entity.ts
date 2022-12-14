import { UserEntity } from "src/users/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MemberRole } from "../models/memberRole.model";
import { MessageEntity } from "./message.entity";
import { RoomEntity } from "./room.entity";

@Entity({ name: "Member" })
export class MemberEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: true })
    isMember: boolean;

    @Column({ nullable: true })
    muteUntil: Date;

    @Column({ nullable: true })
    banUntil: Date;

    @ManyToOne(() => UserEntity)
    @JoinColumn()
    user: UserEntity;

    @Column()
    role: MemberRole;

    @Column()
    socketId: string;

    @OneToMany(() => MessageEntity, message => message.member, { cascade: true })
    messages: MessageEntity[];

    @ManyToMany(() => RoomEntity, (rooms) => rooms.members)
    rooms: RoomEntity[];

    @CreateDateColumn()
    created_at: Date;

}