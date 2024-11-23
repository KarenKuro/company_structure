import { AUTH_ERROR_MESSAGES } from './auth';
import { EMPLOYEE_ERROR_MESSAGES } from './employee';

export const ERROR_MESSAGES = {
  ...AUTH_ERROR_MESSAGES,
  ...EMPLOYEE_ERROR_MESSAGES,
};
