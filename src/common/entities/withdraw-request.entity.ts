import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { WithdrawStatus } from '../enums/withdraw-status.enum';
import { WithdrawUserType } from '../enums/withdraw-user-type.enum';
import { UserEntity } from './user.entity';

export enum WithdrawMethod {
    CASH = 'Cash',
    BANK = 'Bank',
    BKASH = 'bKash',
}

@Entity('withdraw_requests')
export class WithdrawRequestEntity {
    @PrimaryGeneratedColumn()
    withdrawId: number;

    @Column({ type: 'enum', enum: WithdrawUserType })
    userType: WithdrawUserType;

    @ManyToOne(() => UserEntity)
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
