const express = require('express');
const httpProxy = require('http-proxy');
const app = express();
const proxy = httpProxy.createProxyServer();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.API_GATEWAY_PORT || 3000;

app.use(cors());

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

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/api/users', (req, res) => {
  proxy.web(req, res, { target: services.userService });
});

app.use('/api/tasks', authenticate, (req, res) => {
  proxy.web(req, res, { target: services.tasksService, changeOrigin: true});
});

proxy.on('error', (err, req, res) => {
  console.log(services);
  console.error('Proxy error:', err);
  res.status(500).json({ error: 'Proxy error' });
});


app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});