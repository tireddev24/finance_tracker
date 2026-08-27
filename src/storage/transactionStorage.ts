import { type Transaction } from "../types";

const STORAGE_KEY = "finance-tracker-transactions";

export function saveTransactions(transactions: Transaction[]): void {
    //

    try {
        const data = JSON.stringify(transactions)
        localStorage.setItem(STORAGE_KEY, data);
    } catch (error) {
        console.error("Error saving transactions:", error);
    }
}



export function loadTransactions(): Transaction[] {

    //
    try {
        const data = localStorage.getItem(STORAGE_KEY)


        if (!data) {
            return []
        }

        const transactions = JSON.parse(data)

        return transactions;
    } catch (error) {
        console.log("Error loading transactions:", error);
        return []
    }
}