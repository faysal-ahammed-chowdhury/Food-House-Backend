import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('forgot_password')
export class ForgotPassEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number;

    @Column()
    OPT!: string;

    @Column()
    expiresAt!: Date;
}
