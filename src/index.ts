import { randomUUID } from "crypto";
import express, { NextFunction, Request, Response } from "express";
import { Customer, Statement } from "./types";

const PORT = 3001;

const customers: Customer[] = [];

const app = express();

app.use(express.json());

function getBalance(statements: Statement[]) {
  const balance = statements.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0.0);

  return balance;
}

function verifyIfExistsAccountCPF(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return res.status(400).json({ error: "Customer not found" });
  }

  req.customer = customer;

  return next();
}

app.use("/account", (req, res) => {
  const { cpf, name } = req.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return res.status(400).json({ error: "Customer already exists!" });
  }

  const id = randomUUID();

  customers.push({
    id,
    name,
    cpf,
    statements: [],
  });

  return res.status(201).send();
});

app.get("/statement", verifyIfExistsAccountCPF, (req, res) => {
  return res.json(req.customer!.statements);
});

app.post("/deposit", verifyIfExistsAccountCPF, (req, res) => {
  const { description, amount } = req.body;
  const { customer } = req;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };

  customer!.statements.push(statementOperation);

  return res.status(201).send();
});

app.post("/withdraw", verifyIfExistsAccountCPF, (req, res) => {
  const { amount } = req.body;
  const { customer } = req;

  const balance = getBalance(customer!.statements);

  console.log(balance);

  if (balance < amount) {
    return res.status(400).json({ error: "Isufficient funds!" });
  }

  const statementOperation = {
    description: "Withdraw",
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer!.statements.push(statementOperation);

  return res.status(201).send();
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
