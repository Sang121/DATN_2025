const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
mongoose.set('strictQuery', false);
const cors = require('cors');
const connectDB = require('./config/connect');
const routes = require('./routes');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

const app= express();
const port = process.env.PORT || 3001;

 // Thêm dòng này
 app.use(express.json()); // để xử lý req.body

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();
routes(app);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});