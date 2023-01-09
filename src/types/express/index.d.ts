import { Customer } from "../../types";

declare global {
  namespace Express {
    export interface Request {
      customer?: Customer;
    }
  }
}
