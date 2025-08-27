// import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './components/Login/Login'
import ValidateAccessCode from './components/ValidateAccessCode/ValidateAccessCode.tsx';
import SetupAccount from './components/SetUpAccount/SetUpAccount.tsx';
import DashboardStudent from './components/Student/Student.tsx';
import DashboardInstructor from './components/Instructor/Instructor.tsx';
import ChatApp from './components/Instructor/Chat.tsx';
function App() {
  return(
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login/>}></Route>
      <Route path='/validateAccessCode' element={<ValidateAccessCode/>}></Route>
      <Route path='/setup/' element={<SetupAccount/>}></Route>
      <Route path='/student/dashboard' element={<DashboardStudent/>}></Route>
      <Route path='/instructor/dashboard'element={<DashboardInstructor/>}></Route>
      <Route path='/chats' element={<ChatApp/>}></Route>
    </Routes>
    </BrowserRouter>

    </>
  )
}

export default App
