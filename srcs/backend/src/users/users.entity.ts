

import { GameEntity } from 'src/game/game.entity';
import { BaseEntity, Entity, Unique, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { MessageEntity } from 'src/chat/entities/message.entity';
import { RoomEntity } from 'src/chat/entities/room.entity';
import { MemberEntity } from 'src/chat/entities/member.entity';
import { ConnectedUserEntity } from 'src/chat/entities/connected-user.entity';

@Entity({ name: 'User' })
@Unique(['id'])
export class UserEntity extends BaseEntity {

  @PrimaryColumn({ nullable: false, type: 'integer' })
  id: number;

  @Column({ nullable: false, type: 'varchar', length: 200 })
  username: string;

  @Column({ nullable: false, type: 'varchar', length: 200 })
  fullname: string;

  @Column({ nullable: false, type: 'varchar', length: 2048 })
  avatar_url: string;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  refreshtoken: string;

  @Column({ nullable: true, type: 'boolean', default: false })
  tfa_enabled: boolean;

  @Column({ nullable: true, type: 'varchar', length: 200 })
  tfa_code: string;

  @OneToMany(() => MemberEntity, member => member.user)
  members: MemberEntity[];

  @Column({ type: 'int', default: 800 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  login_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: false, type: 'boolean', default: false })
  tfa_fulfilled: boolean;

  @Column({ nullable: true, type: 'varchar', length: 50 })
  status: string = "offline";

  @OneToOne(() => ConnectedUserEntity, connectedUser => connectedUser.user)
  @JoinColumn()
  connected_user: ConnectedUserEntity;


}
