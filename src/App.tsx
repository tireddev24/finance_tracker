
import { useEffect, useState, } from 'react'
import './App.css'
import { addTransaction, editTransaction, getBalance, getMonthlyTotals, getVisibleTransactions, objConvertToRechartRequired, removeTransaction, } from './logic/transactions'
import { loadTransactions, saveTransactions } from './storage/transactionStorage'
import type { Transaction, ChartData } from './types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AddTransactionFormProps {
  transactions: Transaction[],
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
}

function MonthlyChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" fill="#4f46e5" />
      </BarChart>
    </ResponsiveContainer>
  );
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

  const inputClasses = 'p-2 flex-1 rounded-md border-2 border-blue-400 focus:ring-2 ring-blue-500 outline-none'

  return <>
    <form onSubmit={handleAddTransaction} className='flex flex-col md:flex-row gap-4 p-4'>

      <input

        type='number'
        placeholder='Amount'
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        required
        className={`${inputClasses}`}
      />
      <input
        placeholder='Category'
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className={`${inputClasses}`}

        required
      />
      <div className='flex flex-row gap-2 md:flex-col'>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`${inputClasses}`}
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value as "income" | "expense")}
          className={`${inputClasses}`}

        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      <input
        type="text"
        placeholder='Additional notes'
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className={`${inputClasses}`}


      />
      <button type="submit" className='bg-blue-500 text-white flex-1 hover:bg-blue-600 rounded-md p-2 focus:ring-2 ring-blue-500 outline-none cursor-pointer'>Add Transaction</button>
    </form>
  </>

}


function App() {

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const uniqueCategories = [...new Set(transactions.map(t => t.category))]
  const monthlyTotals = getMonthlyTotals(transactions)



  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValues, setEditingValues] = useState<Omit<Transaction, "id">>({

    amount: 0,
    category: "",
    date: "",
    type: "income",
    note: ""


  })


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
      note: transaction.note ?? ""
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

  const inputClasses = 'p-2 flex-1 rounded-md border-2 border-blue-400 focus:ring-2 ring-blue-500 outline-none'
  const btngreen = "bg-green-500 text-white rounded-md py-2 px-2 hover:bg-green-600 cursor-pointer flex-1";
  const btnred = "bg-red-500 text-white rounded-md py-2 px-2 hover:bg-red-600 cursor-pointer flex-1";
  const btnblue = "bg-blue-500 text-white rounded-md py-2 px-2 hover:bg-blue-600 cursor-pointer flex-1";
  const cardClasses = "border rounded-lg p-4 shadow-sm";


  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">

        <h1 className='text-3xl font-bold text-gray-800'>

          Finance Tracker
        </h1>

        <div className={cardClasses}>
          <h2 className="text-xl font-semibold">Balance</h2>
          <p className={`text-2xl font-bold ${getBalance(transactions) >= 0 ? "text-green-600" : "text-red-600"}`}>
            ${getBalance(transactions).toFixed(2)}
          </p>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            placeholder="Search by category or note"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-2 rounded-md border-2 border-gray-300 focus:ring-2 ring-blue-500 outline-none"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded-md border-2 border-gray-300 focus:ring-2 ring-blue-500 outline-none"
          >
            <option value="all">All</option>
            {uniqueCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>

        </div>
        <div className={cardClasses}>

          {/* Desktop: real table, hidden below md */}
          <table className="hidden md:table w-full text-center">

            <thead>
              <tr>

                <th>Amount</th>
                <th>Category</th>
                <th>  Type</th>
                <th>Date</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getVisibleTransactions(transactions, searchQuery, selectedCategory).length <= 0 ? <tr>
                <td colSpan={6} className='font-bold text-lg text-center py-2'>No records to show</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr> : getVisibleTransactions(transactions, searchQuery, selectedCategory).map((t) => (t.id !== editingId ? <tr key={t.id}>

                <td>{t.amount}</td>
                <td>{t.category}</td>
                <td>{t.type}</td>
                <td>{t.date}</td>
                <td>{t.note}</td>
                <td className='flex gap-2 justify-center p-2'>
                  <button className={btnblue} onClick={() => handleSetToEditing(t.id)}>Edit</button>
                  <button className={btnred} onClick={() => handleRemoveTransaction(t.id)}>Delete</button></td>
              </tr> :
                <tr key={t.id}>
                  <td><input className={inputClasses} type='text' value={editingValues.amount} onChange={(e) => setEditingValues({ ...editingValues, amount: Number(e.target.value) })} /></td>
                  <td><input className={inputClasses} type='text' value={editingValues.category} onChange={(e) => setEditingValues({ ...editingValues, category: e.target.value })} /></td>
                  <td>      <select className={inputClasses} value={editingValues.type} onChange={(e) => setEditingValues({ ...editingValues, type: e.target.value as "income" | "expense" })}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select></td>
                  <td><input className={inputClasses} type='date' value={editingValues.date} onChange={(e) => setEditingValues({ ...editingValues, date: e.target.value })} /></td>
                  <td><input className={inputClasses} type='text' value={editingValues.note} onChange={(e) => setEditingValues({ ...editingValues, note: e.target.value })} /></td>
                  <td className='flex gap-2 justify-center p-2 '><button className={btngreen} onClick={() => handleEditTransaction(t.id)}>Save</button>
                    <button className={btnred} onClick={() => { setEditingId(null) }}>Cancel</button></td> </tr>
              ))}
            </tbody>
          </table>


          {/* Mobile: cards, hidden at md and above */}


          <div className="md:hidden flex flex-col gap-3">

            {getVisibleTransactions(transactions, searchQuery, selectedCategory).length > 0 ?
              getVisibleTransactions(transactions, searchQuery, selectedCategory).map((t) => t.id !== editingId ? <div key={t.id} className="border rounded-lg p-4 shadow-sm flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">{t.category}</span>
                  <span className={t.type === "income" ? "text-green-600" : "text-red-600"}>
                    {t.type === "income" ? "+" : "-"}${t.amount}
                  </span>
                </div>
                <div className="text-sm text-gray-500">{t.date}</div>
                {t.note && <div className="text-sm text-gray-600">{t.note}</div>}
                <div className="flex gap-2 mt-2">
                  <button className={btnblue} onClick={() => handleSetToEditing(t.id)}>Edit</button>
                  <button className={btnred} onClick={() => handleRemoveTransaction(t.id)}>Delete</button>
                </div>
              </div> :
                <div key={t.id} className='border rounded-lg p-4 shadow-sm flex flex-col gap-1'>
                  <div className='flex flex-col gap-2'>
                    <input className={inputClasses} type="text" placeholder='Category...' value={editingValues.category} onChange={(e) => setEditingValues({ ...editingValues, category: e.target.value })} />
                    <input className={inputClasses} type="text" placeholder='Amount...' value={editingValues.amount} onChange={(e) => setEditingValues({ ...editingValues, amount: Number(e.target.value) })} />
                    <input className={inputClasses} type="date" value={editingValues.date} onChange={(e) => setEditingValues({ ...editingValues, date: e.target.value })} />
                    <input className={inputClasses} type="text" placeholder='Additional notes...' value={editingValues.note} onChange={(e) => setEditingValues({ ...editingValues, note: e.target.value })} />
                    <select className={inputClasses} value={editingValues.type} onChange={(e) => setEditingValues({ ...editingValues, type: e.target.value as "income" | "expense" })}>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                    <div className="flex gap-2 mt-2">

                      <button className={btngreen} onClick={() => handleEditTransaction(t.id)}>Save</button>
                      <button className={btnred} onClick={() => setEditingId(null)}>Cancel</button>
                    </div>

                  </div>


                </div>
              )

              : <div className='border rounded-lg p-4 shadow-sm flex flex-col gap-1'>No records to show</div>
            }

          </div>
        </div>

        <div className={cardClasses}>

          <AddTransactionForm transactions={transactions} setTransactions={setTransactions} />

        </div>





        {/* Monthly Totals */}
        <div className={cardClasses}>
          <h2 className="text-xl font-semibold mb-3">Monthly Totals</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Month</th>
                <th className="py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(monthlyTotals).map(([month, total]) => (
                <tr key={month} className="border-b last:border-0">
                  <td className="py-2">{month}</td>
                  <td className={`py-2 font-medium ${total >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {total >= 0 ? "+" : ""}${total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Chart */}
        <div className={cardClasses}>
          <h2 className="text-xl font-semibold mb-3">Monthly Overview</h2>
          <MonthlyChart data={objConvertToRechartRequired(monthlyTotals)} />
        </div>



      </div>





    </>
  )
}

export default App
