import { UserEntity } from 'src/users/users.entity';
import { BaseEntity, Entity, Unique, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'Auth' })
@Unique(['id'])
export class AuthEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @Column({ type: 'varchar' })
  hash: string;

  @Column({ nullable: false, type: 'boolean', default: false })
  used: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
