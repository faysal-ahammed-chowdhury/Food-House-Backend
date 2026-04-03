import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { WithdrawMethod } from '../enums/withdraw-method.enum';
import { WithdrawStatus } from '../enums/withdraw-status.enum';
import { WithdrawUserType } from '../enums/withdraw-user-type.enum';
import { UserEntity } from './user.entity';

@Entity('withdraw_requests')
export class WithdrawRequestEntity {
    @PrimaryGeneratedColumn()
    withdrawId: number;

    @Column({ type: 'enum', enum: WithdrawUserType })
    userType: WithdrawUserType;

    @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Column('float')
    amount: number;

    @Column({ type: 'enum', enum: WithdrawMethod })
    method: WithdrawMethod;

    @Column({
        type: 'enum',
        enum: WithdrawStatus,
    })
    status: WithdrawStatus;

    @Column('timestamp')
    requestedAt: Date;

    @Column('timestamp', { nullable: true })
    processedAt?: Date;
}
