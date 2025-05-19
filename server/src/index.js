const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const cors = require('cors');
const connectDB = require('./config/connect');
const routes = require('./routes');
const bodyParser = require('body-parser');
const app= express();
const port = process.env.PORT || 3001;




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
connectDB();
routes(app);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});