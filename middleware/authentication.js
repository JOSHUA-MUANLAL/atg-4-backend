const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];


  if (!token) {
    console.log("NO token")
    return res.status(403).json({ error: 'no token' });
  }

  try {
   
    const decoded = jwt.verify(token, 'joshua');

    req.userdetail = decoded;
   
    next();
  } catch (error) {
    console.log("refuse invalid token")
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;