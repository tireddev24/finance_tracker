export type TransactionType = "income" | "expense";


export interface Transaction {
    id: string;
    amount: number;
    category: string;
    type: TransactionType
    date: string;
    note?: string
}


export interface ChartData {
    name: string
    total: number
}


//id: string
// ID, especially when incremental are easy to trace. In the case of an attack on my database or datastore, it would make it harder for such attacker to find a transaction just by entering any number. A combination of letters and numbers makes it more difficult to access sensitive data.

// Date: String
// Because we are storing the date in local storage for now, it is preferable to use a string as localstorage does not recognize date objects. Localstorage stores the date object as a string 