// import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './components/Login/Login'
import ValidateAccessCode from './components/ValidateAccessCode/ValidateAccessCode.tsx';
import SetupAccount from './components/SetUpAccount/SetUpAccount.tsx';
import MessageWithStudent from './components/Instructor/Message.tsx';
import { AppDashBoard } from './components/AppDashboard.tsx';
function App() {
  return(
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login/>}></Route>
      <Route path='/validateAccessCode' element={<ValidateAccessCode/>}></Route>
      <Route path='/setup/' element={<SetupAccount/>}></Route>
      <Route path='/dashboard' element={<AppDashBoard/>}></Route>
      <Route path='/chats' element={<MessageWithStudent/>}></Route>
    </Routes>
    </BrowserRouter>

    </>
  )
}

export default App
