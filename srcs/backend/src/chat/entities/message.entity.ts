
import { UserEntity } from "src/users/users.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MemberEntity } from "./member.entity";
import { RoomEntity } from "./room.entity";

@Entity({ name: "Message" })
export class MessageEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @ManyToOne(() => MemberEntity, (member) => member.messages)
    @JoinColumn()
    member: MemberEntity;

    @ManyToOne(() => RoomEntity, (room) => room.messages, { onDelete: "CASCADE" })
    @JoinColumn()
    room: RoomEntity;

    @CreateDateColumn()
    created_at: Date;

	@Column('boolean', {default: false})
    read: boolean;

}
