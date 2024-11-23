import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { EmployeeEntity } from './employee.entity';

@Entity({ name: 'departments' })
export class DepatrmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'director_id' })
  director: EmployeeEntity;
}
