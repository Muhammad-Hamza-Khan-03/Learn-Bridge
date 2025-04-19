import React from 'react'
import {Routes,Route} from "react-router"
import AppWithTheme from './pages/Home/LandingPage'
import { ThemeProvider } from './components/ui/theme-context'
import SignupPage from './pages/auth/signupPage'
import SignInPage from './pages/auth/signinPage'
export default function App() {
  return (
    <ThemeProvider>
    <Routes>
      <Route path="/" element={<AppWithTheme />} />
      <Route path="/signup" element={<SignupPage/>}/>
      <Route path='/signin' element={<SignInPage/>}></Route>
    </Routes>

    </ThemeProvider>
  )
}
