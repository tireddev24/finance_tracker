
import { useEffect, useState, } from 'react'
import './App.css'
import { addTransaction, editTransaction, getBalance, getTotalByType, removeTransaction } from './logic/transactions'
import { loadTransactions, saveTransactions } from './storage/transactionStorage'
import type { Transaction } from './types'


interface AddTransactionFormProps {
  transactions: Transaction[],
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
}

function AddTransactionForm({ transactions, setTransactions }: AddTransactionFormProps) {
  const [amount, setAmount] = useState<number>(0)
  const [date, setDate] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [type, setType] = useState<"income" | "expense">("income")
  const [note, setNote] = useState<string>("")

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    const newTransaction: Omit<Transaction, "id"> = { amount, date, category, type, note }

    const newTransactions = addTransaction(transactions, newTransaction)
    saveTransactions(newTransactions)
    setAmount(0)
    setDate("")
    setCategory("")
    setType("income")
    setNote("")
    setTransactions(newTransactions)
  }


  return <>
    <form onSubmit={handleAddTransaction}>

      <input

        type='number'
        placeholder='Amount'
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        required
      />
      <input
        type="date"
        placeholder='2026-01-01'
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <input
        placeholder='Category'
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <select value={type} onChange={(e) => setType(e.target.value as "income" | "expense")}>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <input
        type="text"
        placeholder='Additional notes'
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button type="submit">Add Transaction</button>
    </form>
  </>

}


function App() {

  const [transactions, setTransactions] = useState<Transaction[]>([])


  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValues, setEditingValues] = useState<Omit<Transaction, "id">>({

    amount: 0,
    category: "",
    date: "",
    type: "income",
    note: ""


  })



  const handleBalance = () => {
    const newBalance = getBalance(transactions)
    console.log("Balance: ", newBalance)
  }

  const handleGetTotalByType = () => {
    const totalIncome = getTotalByType(transactions, 'income')
    const totalExpense = getTotalByType(transactions, 'expense')
    console.log("Total Income: ", totalIncome)
    console.log("Total Expense: ", totalExpense)
  }


  const handleSetToEditing = (id: string) => {
    setEditingId(id)

    const transaction = transactions.find((t) => t.id === id)
    if (!transaction) {
      return;
    }

    setEditingValues({
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
      type: transaction.type,
      note: transaction.note
    })
  }
  const handleEditTransaction = (id: string) => {


    const newTransactions = editTransaction(transactions, id, { ...editingValues })
    saveTransactions(newTransactions)
    setTransactions(newTransactions)

    setEditingId(null)
    console.log("Updated: ", newTransactions)
  }

  const handleRemoveTransaction = (id: string) => {
    const newTransactions = removeTransaction(transactions, id)
    saveTransactions(newTransactions)
    setTransactions(newTransactions)
    console.log("Length: ", newTransactions.length)
  }

  useEffect(() => {
    const transactions = loadTransactions()
    console.log("Transactions", transactions)
    setTransactions(transactions)
  }, [])

  return (
    <>
      <h1 className='text-3xl font-bold underline'>

        Hello World
      </h1>

      <table>
        <tr>
          <th>ID</th>
          <th>Amount</th>
          <th>Category</th>
          <th>Type</th>
          <th>Date</th>
          <th>Note</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
        {transactions.map((t) => (t.id !== editingId ? <tr key={t.id}>

          <td>{t.id}</td>
          <td>{t.amount}</td>
          <td>{t.category}</td>
          <td>{t.type}</td>
          <td>{t.date}</td>
          <td>{t.note}</td>
          <td><button onClick={() => handleSetToEditing(t.id)}>Edit</button>
          </td><td><button onClick={() => handleRemoveTransaction(t.id)}>Delete</button></td> </tr> :
          <tr key={t.id}>
            <td><input type='text' value={t.id} disabled /></td>
            <td><input type='text' value={editingValues.amount} onChange={(e) => setEditingValues({ ...editingValues, amount: Number(e.target.value) })} /></td>
            <td><input type='text' value={editingValues.category} onChange={(e) => setEditingValues({ ...editingValues, category: e.target.value })} /></td>
            <td>      <select value={editingValues.type} onChange={(e) => setEditingValues({ ...editingValues, type: e.target.value as "income" | "expense" })}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select></td>
            <td><input type='date' value={editingValues.date} onChange={(e) => setEditingValues({ ...editingValues, date: e.target.value })} /></td>
            <td><input type='text' value={editingValues.note} onChange={(e) => setEditingValues({ ...editingValues, note: e.target.value })} /></td>
            <td><button onClick={() => handleEditTransaction(t.id)}>Save</button>
            </td><td><button onClick={() => { setEditingId(null) }}>Cancel</button></td> </tr>
        ))}
      </table>
      <AddTransactionForm transactions={transactions} setTransactions={setTransactions} />
      <button onClick={handleBalance}>Get Balance</button>
      <button onClick={handleGetTotalByType}>Get Total By Type</button>
    </>
  )
}

export default App
