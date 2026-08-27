import { type Transaction, type TransactionType } from "../types";

export function addTransaction(
    transactions: Transaction[],
    newTxn: Omit<Transaction, "id">
): Transaction[] {
    // generate an id, return new array with the added transaction
    //Omit makes sure that the new object coming in does not already have the id assigned
    //It throws an error when passing an object that already has the id property.
    const id = crypto.randomUUID();
    const newTransaction = { ...newTxn, id: id };

    return [...transactions, newTransaction];
}

export function removeTransaction(
    transactions: Transaction[],
    id: string
): Transaction[] {

    const newTransactions = transactions.filter((t) => t.id !== id)
    return newTransactions;

}

export function editTransaction(
    transactions: Transaction[],
    id: string,
    updates: Partial<Transaction>
): Transaction[] {

    //partial allows me to send only the properties I want to update
    // while still preventing me from adding new properties to the object

    const transaction = transactions.find((t) => t.id === id)
    if (!transaction) {
        console.error("Transaction not found")
        return transactions;
    }

    const updated = { ...transaction, ...updates }

    const updatedTransactions = transactions.map((t) => t.id === id ? updated : t)

    return updatedTransactions;
}

export function getTotalByType(
    transactions: Transaction[],
    type: TransactionType
): number {
    // you already wrote this exact logic in the earlier exercise

    const totalByType = transactions.reduce((total, t) => {
        if (t.type === type) {
            total += t.amount
        }
        return total;
    }, 0)

    return totalByType
}


export function getBalance(transactions: Transaction[]): number {
    // income total minus expense total
    const income = getTotalByType(transactions, "income")
    const expense = getTotalByType(transactions, "expense")
    return income - expense
}

export function filterByCategory(
    transactions: Transaction[],
    category: string
): Transaction[] {
    const transactionsByCategory = transactions.filter((t) => t.category === category)
    return transactionsByCategory;

}