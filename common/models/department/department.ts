import { IEmployee } from "../employee";

export interface IDepartment {
  id: number;
  name: string;
  director: number | IEmployee;
}