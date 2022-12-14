import { Column, Entity, PrimaryGeneratedColumn, Unique, CreateDateColumn, UpdateDateColumn, OneToOne, JoinTable, JoinColumn, OneToMany, ManyToOne} from "typeorm";
import { UserEntity } from "src/users/users.entity";


@Entity({ name: "Achievements" })
@Unique(['id'])
export class AchievementsEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user', referencedColumnName: 'id' })
    user: UserEntity;

    @Column()
    achievement: string;

    @Column()
    description: string;

    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
}
