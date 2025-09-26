// import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './components/Login/Login'
import ValidateAccessCode from './components/ValidateAccessCode/ValidateAccessCode.tsx';
import SetupAccount from './components/SetUpAccount/SetUpAccount.tsx';
import MessageWithStudent from './components/Instructor/Message.tsx';
import AppLayout from './components/LayOut/AppLayout.tsx';
import MessageWithInstructor from './components/Student/Message.tsx';
import ListStudent from './components/Instructor/ListStudent/ListStudent.tsx';
import ProfilePage from './components/Student/Profile.tsx';
import { NotificationProvider } from './hooks/Notification/notificationMessage.tsx';
import ListLession from './components/Student/ListLession.tsx';
function App() {
  return(
    <>
    <BrowserRouter>
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<Login/>}></Route>
        <Route path='/validateAccessCode' element={<ValidateAccessCode/>}></Route>
        <Route path='/setup/' element={<SetupAccount/>}></Route>
        <Route path="student" element={<AppLayout/>}>
          <Route path='dashboard' element={<ListLession/>}></Route>
          <Route path='messages' element={<MessageWithInstructor/>}></Route>
          <Route path='messages/:instructorId' element={<MessageWithInstructor/>}></Route>
          <Route path='profile' element={<ProfilePage/>}></Route>
        </Route>

        <Route path="instructor" element={<AppLayout/>}>
          <Route path='dashboard' element={<ListStudent/>}></Route>
          <Route path='messages' element={<MessageWithStudent/>}></Route>
          <Route path='messages/:studentId' element={<MessageWithStudent/>}></Route>
        </Route>
      </Routes>
    </NotificationProvider>
    </BrowserRouter>

    </>
  )
}

export default App
