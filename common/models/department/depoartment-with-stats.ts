import { IDepartment } from './department';

export interface IDepartmentWithStats extends IDepartment {
  employeeCount: number;
  totalSalary: number;
}
