import React,{useState, useEffect} from 'react'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import axios from "axios"
import Skeleton from '@mui/material/Skeleton';

const Cards = () => {
      const [studentlist, setStudentList] = useState(null);
      const [subjectlist, setSubjectList] = useState(null);
      const [loadingCards, setLoadingCards] = useState(true);

        // ✅ Fetch student and subject lists
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, subjectsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/studentlist", {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
          }),
          axios.get("http://localhost:5000/api/subjectlist", {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
          }),
        ]);
        setStudentList(studentsRes.data);
        setSubjectList(subjectsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingCards(false);
      }
    };
    fetchData();
  }, [studentlist, subjectlist]);

  return (
    <div className="list-container">
        {loadingCards ? (
          <>
           <Skeleton variant="rounded" width={260} height={190} />
           <Skeleton variant="rounded" width={260} height={190} />
           
          </>
        ) : (
          <>
            <div className="list-card studentlist-card">
              <PeopleAltOutlinedIcon style={{ color: "#93bbfa", fontSize: "30px" }} />
              <h2>Students</h2>
              <h1>{studentlist?.count || 0}</h1>
            </div>

            <div className="list-card subjectlist-card">
              <ListAltOutlinedIcon style={{ color: "#f5ffa7", fontSize: "30px" }} />
              <h2>Subjects</h2>
              <h1>{subjectlist?.count || 0}</h1>
            </div>
          </>
        )}
      </div>
  )
}

export default Cards
