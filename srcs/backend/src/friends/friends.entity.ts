import { Column, Entity, PrimaryGeneratedColumn, Unique, CreateDateColumn, UpdateDateColumn, OneToOne, JoinTable, JoinColumn, OneToMany, ManyToOne } from "typeorm";
import { UserEntity } from "src/users/users.service";


@Entity({ name: "Friends" })
@Unique(['id'])
export class FriendsEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user1', referencedColumnName: 'id' })
    user1: UserEntity;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user2', referencedColumnName: 'id' })
    user2: UserEntity;

    @Column()
    accepted: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}