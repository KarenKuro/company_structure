import { FileHelpers } from '@common/helpers';
import { Transform } from 'class-transformer';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DepatrmentEntity } from './department.entity';

@Entity({ name: 'employee' })
export class EmployeeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  patronymic: string;

  @Column()
  @Index()
  lastName: string;

  @Column()
  @Transform(({value}) => {
    return FileHelpers.generatePath(value?.path);
  })
  photo: string;

  @Column()
  jobTitle: string;

  @Column()
  salary: number;

  @Column()
  age: number;

  @ManyToOne(() => DepatrmentEntity)
  @JoinColumn({name: 'department_id'})
  department: DepatrmentEntity;
}
