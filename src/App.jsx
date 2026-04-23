import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import ResultsPage from './pages/ResultsPage'
import TeacherPage from './pages/TeacherPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/play" element={<GamePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/teacher" element={<TeacherPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
