import { IPlayer } from './game.interface';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { UserEntity } from 'src/users/users.entity';

@Entity({ name: "Games" })
@Unique(['id'])
export class GameEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    usernameP1: string;

    @Column()
    usernameP2: string;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'idP1', referencedColumnName: 'id' })
    idP1: UserEntity;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'idP2', referencedColumnName: 'id' })
    idP2: UserEntity;

    @Column()
    socketP1: string;

    @Column()
    socketP2: string;

    @Column()
    scoreP1: number;

    @Column()
    scoreP2: number;

    @Column({nullable: false, type: 'boolean', default: false })
    isChallenge: boolean;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'winner', referencedColumnName: 'id' })
    winner: UserEntity;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}