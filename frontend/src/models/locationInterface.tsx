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
  email:string
}

export interface Subject {
  id:string,
  name:string
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