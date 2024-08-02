const express = require('express');
const httpProxy = require('http-proxy');
const app = express();
const proxy = httpProxy.createProxyServer();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.API_GATEWAY_PORT || 3000;

app.use(cors());

// 100 request per 10 mins
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100
});

app.use(limiter);


// Authenticate the user
function authenticate(req, res, next){

  const token = req.headers.authorization;
  const parsedToken = token.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(parsedToken, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Session timed out, Login Again!" });
    }
    next();
  });
}

const services = {
  userService: process.env.USER_SERVICE_URL,
  tasksService: process.env.TASKS_SERVICE_URL,
};

// Request timeout

const timeout = (ms) => (req, res, next) => {
  res.setTimeout(ms, () => {
    res.status(504).json({ error: 'Gateway Timeout' });
  });
  next();
};

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
// Route to users service
app.use('/api/users', timeout(5000),(req, res) => {
  proxy.web(req, res, { target: services.userService });
});

// route to tasks service
app.use('/api/tasks', authenticate, timeout(5000), (req, res) => {
  proxy.web(req, res, { target: services.tasksService, changeOrigin: true});
});

// handling error 
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (err.code === 'ECONNRESET') {
    res.status(504).json({ error: 'Gateway Timeout' });
  } else {
    res.status(500).json({ error: 'Proxy error' });
  }
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});