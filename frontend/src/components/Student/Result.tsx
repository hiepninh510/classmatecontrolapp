import { useEffect, useState } from "react"
import type { Accumulate, MyScores } from "../../models/locationInterface";
import { useAuth } from "../../hooks/ThemeContext";
import axios from "../../api/api";
import ResultTable from "./ResultTable";
import {CreditPieChart} from "./Chart";

export default function Result(){
    const [myScores,setMyScores] = useState<MyScores[]>([]);
    const [creadits,setCredits] = useState<Accumulate>();
    const {id} = useAuth();

    const fetchMyScores = async (id:string)=>{
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/student/getMyScores/${id}`);
        if(res.data.success){
            setMyScores(res.data.scoreData);
            setCredits(res.data.credits);

        }
    }

    useEffect(()=>{
        fetchMyScores(id as string);
    },[id])
    return(
        <>
        <div>
            <CreditPieChart creditsProps={creadits!}/>
        </div>
        <div>
            <ResultTable myScores={myScores} />
        </div>
        </>
    )
}