import {db} from '../config/firebase.js';

export async function saveScore(data){
    try {
        const batch = db.batch();
        for(const item of data){
            const scoreSnap = await db.collection("scores").where("studentId","==",item.id).get();
            if(scoreSnap.empty) return {success:false,message:"Điểm chưa được khởi tạo"};

            const docRef = scoreSnap.docs[0].ref;
            const existingScore = scoreSnap.docs[0].data().score || [];

            const index = existingScore.findIndex((s)=>s.phase === item.score[0].phase &&  s.subjectId === item.score[0].subjectId);
            if(!isNaN(item.score[0].total)&& Number(item.score[0].total)>=4) item.score[0].pass = true;
            
            existingScore[index] = { ...existingScore[index], ...item.score[0] };

            batch.update(docRef, { score: existingScore });
        }

        await batch.commit();
        return { success: true, message: "Scores updated successfully" };
    } catch (error) {
        throw error;
    }
}

export async function getMyScores(id) {
    try {
        const studentRef = await db.collection("students").doc(id).get();
        if(!studentRef.exists) return {status:400,success:false,message:"Student dose not exists!!!"};

        const classRef = await db.collection("class").doc(studentRef.data().classId).get();
        if(!classRef.exists) return {status:400,success:false,message:"Class donse not exists!!!"};

        const facultySnap = await db.collection("facultys").doc(classRef.data().facultyId).get();
        if(!facultySnap.exists) return {status:400,success:false,message:"Faculty dose not exists!!!"};

        const totalCredits = facultySnap.data().credits;

        const scoreSnap = await db.collection("scores").where("studentId",'==',id).get();
        if(scoreSnap.empty) return {status:400,success:false,message:"Score not found"};
        const score = scoreSnap.docs[0].data().score;
        const filteredData = await Promise.all(
            score.map(async(item)=>{
                const subjectRef = await db.collection("subjects").doc(item.subjectId).get();
                const phaseRef = await db.collection("phases").doc(item.phase).get();
                if(subjectRef.exists && phaseRef.exists) {
                    return {...item,subjectName:subjectRef.data().name,credits:subjectRef.data().credits,phaseName:phaseRef.data().name}
                } else return null
            })
        )
        const scoreData = filteredData.filter(Boolean);
        let creditsIsPass = 0;
        scoreData.forEach((s)=>{
            if(s.total && s.pass) creditsIsPass += s.credits;
        })
        // const notCredits = totalCredits - creditsIsPass;
        const credits = { creditsIsPass: creditsIsPass, totalCredits: totalCredits};

        return {status:200,success:true, scoreData,credits };
    } catch (error) {
        throw error
    }
}
