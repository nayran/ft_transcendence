import { UserEntity } from "src/users/users.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity({ name: "ConnectedUser" })

export class ConnectedUserEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: true })
    connected: boolean;

    @Column()
    socketId: string;

    @OneToOne(() => UserEntity, user => user.connected_user, { onDelete: "CASCADE" })
    user: UserEntity;
}