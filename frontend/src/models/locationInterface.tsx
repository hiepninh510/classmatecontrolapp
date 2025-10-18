export interface LocationState {
    phoneNumber:string
}

export interface Lession {
  id: string;
  title: string;
  description?: string;
  instructor: string;
  instructorName:string;
  createAt: Date;
  // subjectId:string;
  done:boolean
}

export interface Student {
  id: string;
  name:string,
  phoneNumber:string,
  email:string,
  classRoom:string
}

export interface ClassStudent{
  id:string,
  name:string,
  size:number,
  facultyId:string,

}

export interface Subject {
  id:string,
  name:string,
  facultyId:string,
}

export interface SubjectForAdmin extends Subject{
  instructorNumber:number,
  credits:number,
  active:boolean
}

export interface AssignLessionForClass{
  id:string,
  name:string
}

export interface Profile{
    phoneNumber:string,
    name:string,
    email:string,
    avatar:string
}

export interface Notifi{
    role:string|null,
    type:string|null,
    userId:string|null
}

export interface ScoreStudent{
  id:string,
  name:string,
  className:string,
  classId:string,
  subjectId:string,
  subjectName:string,
  score:Score[]
}
export interface Score{
  final:string | null,
  midterm:string | null,
  phase:string | null,
  total:string | null,
  subjectId:string |null
}

export interface MyScores{
  final:string | null,
  midterm:string | null,
  phase:string | null,
  total:string | null,
  subjectId:string |null,
  subjectName:string,
  phaseName:string,
  credits:number,
  pass:boolean
}

export interface Accumulate{
  creditsIsPass:number,
  totalCredits:number
}

export interface Schedule{
  id:string,
  active:boolean,
  classId:string,
  dayOfWeek:number[],
  idS:string,
  roomId:string,
  subjectId:string,
  timeId:string,
  className:string,
  roomName:string,
  subjectName:string,
  startDate:string,
  endDate:string,
  timeFrame:string,
  facultyId:string,
  facultyName:string
}

export interface ScheduleAddInstructorName extends Schedule {
    instructorName:string,
    instructorId:string
}

export interface ListInstructorForAdmin{
  code: string;
  id:string,
  name:string,
  phoneNumber:string,
  email:string,
  classes:ClassStudent[] | [],
  subjects:Subject[] |[],
  faculty:Faculty,
}

export interface Faculty{
  id:string,
  name:string
}

export interface Classes{
  id:string,
  name:string,
  size:number,
  classSize: number,
  facultyId:string
  faculty:Faculty
}

export interface Rooms{
  id:string,
  name:string,
  active:boolean,
  areas:string,
  isVIP:boolean
}

export interface timeFrames{
  id:string,
  timeFrame:string
}

// export interface Instructors{
//   id:string,
//   code:string,
//   phoneNumber:string,
//   classes:Classes[],
//   faculty:Faculty,
//   email:string,
//   name:string,
//   subjects:Subject[],
// }

