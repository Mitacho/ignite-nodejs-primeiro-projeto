export interface Customer {
  id: string;
  name: string;
  cpf: string;
  statements: Statement[];
}

export interface Statement {
  amount: number;
  description: string;
  type: string;
  created_at: Date;
}
