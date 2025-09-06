const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('.'));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Serve the main marketing page
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'main.html');
  console.log('Serving file:', filePath);
  console.log('File exists:', require('fs').existsSync(filePath));
  res.sendFile(filePath);
});

// Redirect login to client portal
app.get('/login', (req, res) => {
  res.redirect('http://localhost:3001/login');
});

app.listen(PORT, () => {
  console.log(`🌐 Marketing website running on http://localhost:${PORT}`);
  console.log(`📱 Open your browser and go to: http://localhost:${PORT}`);
  console.log(`🔗 Client login integrated and ready!`);
  console.log(`🎯 This is now your main landing page!`);
});