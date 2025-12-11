const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const transactionRoutes = require('./routes/transactions');
const authRoutes = require('./routes/auth'); 

const app = express();
app.use(express.json());
app.use(cors());


const MONGO_URI = "mongodb+srv://admin:Robin1122@cluster0.wkk9ktn.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes); 

app.get('/', (req, res) => {
  res.send('Interest Calculator Backend is Linked!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});