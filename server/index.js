const express = require('express');
const app = express();
const port = 3000;

//db connection
const connectDB = require('./config/database');
connectDB();

//middleware
app.use(express.json());

//routes
const jobRoutes = require('./routes/JobRoutes');
app.use('/api/jobs', jobRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
