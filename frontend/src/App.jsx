import { useState } from 'react'

import './App.css'
import ChatApp from './pages/ChatApp'
import DocumentAssistant from './pages/DocumentAssistant'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DocumentAssistant />
    </>
  )
}

export default App
