import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { CODStatus } from '../enums/cod-status.enum';
import { RiderEntity } from './rider.entity';

@Entity('cod_submissions')
export class CODSubmissionEntity {
    @PrimaryGeneratedColumn()
    codId: number;

    @ManyToOne(() => RiderEntity)
    @JoinColumn({ name: 'riderId' })
    rider: RiderEntity;

    @Column('float')
    amount: number;

    @Column({
        type: 'enum',
        enum: CODStatus,
    })
    status: CODStatus;

    @Column('timestamp')
    submittedAt: Date;

    @Column('timestamp', { nullable: true })
    verifiedAt?: Date;
}
