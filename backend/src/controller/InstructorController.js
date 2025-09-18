import {db} from '../config/firebase.js';
import { normalPhoneNumber } from './formatController.js';

export async function createInstructor(req,res) {
    try {
        const {name,phoneNumber,email} = req.body
        if(!name || !email){
            return res.status(400).json({success:false,message:'Missing fields'})
        }
        const isUserExisting = await db.collection('users').where('phoneNumber','==',phoneNumber).get();

        if(!isUserExisting.empty){
            return res.status(400).json({success:false,message:'Instructor already exists'});
        }
        await db.collection('users').add({
            name,
            phoneNumber,
            email,
            role:'instructor',
            createAt:new Date()
        });
        return res.status(201).json({seccess:true,message:'Instructor added successfully'});
    } catch (error) {
        return res.status(500).json({success:false,error:error.message});
    }
}

export async function findIdInstructor(req,res) {
    try {
        let phoneNumber = req.query.phoneNumber;
        phoneNumber = normalPhoneNumber(phoneNumber);
        const instructorQurey = await db.collection('users').where('phoneNumber','==',phoneNumber).get();
        if(instructorQurey.empty) res.status(400).json({success:false,message:"Instructor not found"});
        const idInstructor = instructorQurey.docs[0].id;
        return res.status(200).json({success:true,senderId:idInstructor});
    } catch (error) {
        res.status(500).json({success:false,message:error});
    }
}
