import { useState, useEffect } from "react";
import axios from "axios";
import {useToast} from "../hooks/use-toast";
import { useNavigate } from "react-router-dom"; 
import "../styles/AuthPage.css"; 
import "@fortawesome/fontawesome-free/css/all.min.css";
import CircularProgress from '@mui/material/CircularProgress';
import Logo from "../assets/logo.png";


const AuthPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", contactNumber:"" }); 
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate(); 

// ✅ Prevent going back to login if user is already logged in
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (token && user) {
      if (user.role === "admin") {
        navigate("/dashboard/admin", { replace: true });
      } else if(user?.role === "parent") {
        navigate("/dashboard/parent", { replace: true });
      }
      else if(user?.role === "instructor"){
       navigate("/dashboard/instructor", { replace: true });
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    if (!isLogin) {
      // REGISTER FLOW
      if (!isOtpSent) {
        // Step 1: Send OTP
        await axios.post("http://localhost:5000/send-otp", { email: formData.email });
        toast({ title: "OTP Sent", description: "Check your Gmail for the 6-digit code." });
        setIsOtpSent(true);
        return;
      } else {
        // Step 2: Verify OTP
        await axios.post("http://localhost:5000/verify-otp", { email: formData.email, otp });

        // Step 3: Register after OTP verification
        await axios.post("http://localhost:5000/register", { ...formData, role: "parent" });

        toast({ title: "Registration Successful", description: "You can now log in with your credentials." });
        setIsLogin(true);
        setIsOtpSent(false);
        return;
      }
    }

    // LOGIN FLOW
    const response = await axios.post("http://localhost:5000/login", formData);
    const { id, token, name, role, email, contactNumber, profilePic } = response.data;

    // Store in sessionStorage
    sessionStorage.setItem("token", token);
    sessionStorage.setItem(
      "user",
      JSON.stringify({ id, name, role, email, contactNumber, profilePic: profilePic || "/default-profile.png" })
    );

    // Redirect based on role
    if (role === "admin") navigate("/dashboard/admin");
    else if (role === "instructor") navigate("/dashboard/instructor");
    else navigate("/dashboard/parent");

  } catch (error) {
    toast({
      title: "Error",
      description: error.response?.data?.message || "An error occurred. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="auth-container">
      <div className="left-section">
        <h2 className="title">Welcome to DBC Parents<span className="portal"> Portal</span></h2>
        <img style={ { width: "120px"}} src={Logo} alt="School Logo" className="logo" />
        <div className="db">
          <h1>Don Bosco College</h1>
          <p>Copyright © 2025 All rights reserved.</p>
        </div>
      </div>

      <div className="right-section">
        <h2 className="sign">{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit}>
          {/* Full Name (Only in Register Form) */}
          {!isLogin && (
            <>
            <div className="input-container">
              <i className="fas fa-user"></i>
              <input type="text" name="name" placeholder="Full Name (e.g., Juan A. Dela Cruz)" onChange={handleChange} required />
            </div>
             <div className="input-container">
             <i className="fas fa-phone"></i>
            <input type="text" name="contactNumber" placeholder="Contact Number" onChange={handleChange} required />
              </div>
          </>)}
          
          {/* Email Field */}
          <div className="input-container">
            <i className="fas fa-envelope"></i>
            <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required />
          </div>

          {/* Password Field */}
          <div className="input-container">
            <i className="fas fa-lock"></i>
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          </div>

          {/* Submit Button */}
          {!isLogin && isOtpSent && (
          <div className="input-container">
            <i className="fas fa-key"></i>
            <input type="text" name="otp" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          </div>
        )}

         <button className="submit" type="submit" disabled={isLoading}>
  {isLogin ? (
    isLoading ? (
      <CircularProgress size="16px" color="white" />
    ) : (
      <>
        <i className="fas fa-sign-in-alt"></i> Login
      </>
    )
  ) : (
    isLoading ? (
       <CircularProgress size="16px" color="white" />
    ) : (
      <>
        <i className="fas fa-user-plus"></i> Register
      </>
    )
  )}
</button>

        </form>

        {isLogin ? (
          <p className="create">
            Don't have an account yet? <br />
            <button className="beforereg" onClick={() => setIsLogin(false)}>Register Here</button>
          </p>
        ) : (
          <p className="ready">
            Already have an account? <br />
            <button className="beforelog" onClick={() => setIsLogin(true)}>Login</button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
