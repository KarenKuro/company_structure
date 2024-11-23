import { IDepartment } from '../department';

export interface IEmployee {
  id: number;
  firstName: string;
  patronymic: string;
  lastName: string;
  photo: string;
  jobTitle: string;
  salary: number;
  age: number;
  department: number;
}
