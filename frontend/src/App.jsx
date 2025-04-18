import { useState } from 'react'
import './App.css'


function App() {
  const [count, setCount] = useState(0)
  
  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Vite + React + Tailwind</h1>
        <p className="text-yellow-300">This is a demonstration of Tailwind CSS working with React and Vite</p>
        <div className="flex justify-center space-x-4 mb-4">
          <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <div className="card">
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-500 hover:bg-blue-700 text-black  font-bold py-2 px-4 rounded"
          >
            count is {count}
          </button>
        </div>
        <p className="read-the-docs bg-red-200 mt-4">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </div>
  )
}

export default App
