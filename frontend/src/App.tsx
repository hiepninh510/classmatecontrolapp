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
import Score from './components/Instructor/Score.tsx';
import Result from './components/Student/Result.tsx';
import Schedules from './components/Schedules/Schedules.tsx';
import DefaultLogin from './components/Login/DefaultLogin.tsx';
import StudentList from './admin/component/StudentList.tsx';
import InstructorList from './admin/component/InstructorList.tsx';
import { Classes } from './admin/component/ClassList.tsx';
import { ListRoom } from './admin/component/RoomList.tsx';
import { SchedulesAdmin } from './admin/component/Schedules/Schedules.tsx';
import { Faculties } from './admin/component/Faculties.tsx';
import ForgotPassword from './components/Login/ForgetPassWord.tsx';
function App() {
  return(
    <>
    <BrowserRouter>
    <NotificationProvider>
      <Routes>
        <Route path= "/" element={<DefaultLogin/>}></Route>
        <Route path="/login" element={<Login/>}></Route>
        <Route path="/forgetpassword" element={<ForgotPassword/>}></Route>
        <Route path='/validateAccessCode' element={<ValidateAccessCode/>}></Route>
        <Route path='/setup/' element={<SetupAccount/>}></Route>

        <Route path='admin' element={<AppLayout/>}>
          <Route path='dashboardStudent' element={<StudentList/>}></Route>
          <Route path='dashboardInstructor' element={<InstructorList/>}></Route>
          <Route path='dashboardClasses' element={<Classes/>}></Route>
          <Route path='dashboardRooms' element={<ListRoom/>}></Route>
          <Route path='dashboardSchedules' element={<SchedulesAdmin/>}></Route>
          <Route path='dashboardFaculties' element={<Faculties/>}></Route>
        </Route>

        <Route path="student" element={<AppLayout/>}>
          <Route path='dashboard' element={<ListLession/>}></Route>
          <Route path='messages' element={<MessageWithInstructor/>}></Route>
          <Route path='result' element={<Result/>}></Route>
          <Route path='messages/:instructorId' element={<MessageWithInstructor/>}></Route>
          <Route path='profile' element={<ProfilePage/>}></Route>
          <Route path='schedule' element={<Schedules/>}></Route>
        </Route>

        <Route path="instructor" element={<AppLayout/>}>
          <Route path='dashboard' element={<ListStudent/>}></Route>
          <Route path='messages' element={<MessageWithStudent/>}></Route>
          <Route path='messages/:studentId' element={<MessageWithStudent/>}></Route>
          <Route path='score' element={<Score/>}></Route>
          <Route path='schedule' element={<Schedules/>}></Route>
        </Route>
      </Routes>
    </NotificationProvider>
    </BrowserRouter>

    </>
  )
}

export default App
