import React,{useState, useEffect} from 'react'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import axios from "axios"
import SortOutlinedIcon from '@mui/icons-material/SortOutlined';
import Skeleton from '@mui/material/Skeleton';
import '../styles/ Cards.css'
const Cards = () => {
      const [studentlist, setStudentList] = useState(0);
      const [subjectlist, setSubjectList] = useState(0);
      const [loadingCards, setLoadingCards] = useState(true);

      //filters
     const [courseFilter, setCourseFilter] = useState("All");
     const [programFilter, setProgramFilter] = useState("All");
     const [yearFilter, setYearFilter] = useState("All");

      const user = JSON.parse(sessionStorage.getItem("user"));

        // ✅ Fetch student and subject lists
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentURL =
          user.role === "admin" || user.role === "instructor"
            ? "http://localhost:5000/api/studentlist/count"
            : "http://localhost:5000/api/studentlist/count/mycourse";

        const [studentsRes, subjectsRes] = await Promise.all([
          axios.get(studentURL, {
            params: {
              course: courseFilter,
              program: programFilter,
              year: yearFilter
            },
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
  }, [courseFilter, programFilter, yearFilter]);

  return (
    <div className="cards-wrapper">

    
      
    <div className="list-container">
       {/* Filtering UI */}
     
      {user.role !== "parent" && (
      
        <div className="filter-bar"> 
        <h3><SortOutlinedIcon style={{ color: "#93bbfa", fontSize: "30px" }}/>Student Filter</h3>         
            <label>Program</label>
          <select onChange={(e) => setProgramFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="BS">BS</option>
            <option value="BTVTED">BTVTED</option>
            <option value="Diploma">Diploma</option>
          </select>
           <label>Course</label>
          <select onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Information Technology">IT</option>
            <option value="Automotive Aftersales">Auto</option>
            <option value="Electro Mechanic Technology">EMT</option>
            <option value="Mechanical Technology">MT</option>
          </select>
            <label>Year Level</label>
          <select onChange={(e) => setYearFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>
        
      )}
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
              <h1>{studentlist.count || 0}</h1>
            </div>

            <div className="list-card subjectlist-card">
              <ListAltOutlinedIcon style={{ color: "#f5ffa7", fontSize: "30px" }} />
              <h2>Subjects</h2>
              <h1>{subjectlist?.count || 0}</h1>
            </div>
          </>
        )}
      </div>
      </div>
  )
}

export default Cards
