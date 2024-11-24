import { AUTH_ERROR_MESSAGES } from './auth';
import { DEPARTMENT_ERROR_MESSAGES } from './department';
import { EMPLOYEE_ERROR_MESSAGES } from './employee';

export const ERROR_MESSAGES = {
  ...AUTH_ERROR_MESSAGES,
  ...EMPLOYEE_ERROR_MESSAGES,
  ...DEPARTMENT_ERROR_MESSAGES,
};
