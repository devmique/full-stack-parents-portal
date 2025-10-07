
const jwt = require('jsonwebtoken');
//Middleware to verify JWT
const verifyToken = (req, res, next)=>{
   const authHeader = req.headers.authorization;

   if(!authHeader || !authHeader.startsWith("Bearer")){
    return res.status(401).json({ error: "Unauthorized" });
   } 
   const token = authHeader.split(" ")[1];

   try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request object
    next();
   } catch(error){
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
   }
}

//Middleware for role-based access control
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized - no user context" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access forbidden: insufficient privileges" });
    }

    next();
  };
};

module.exports = { verifyToken, authorizeRole };