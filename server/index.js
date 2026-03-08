import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config();

const app = express()

//middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) =>{
    res.send('Platform Rebranded Server is Running!')

})

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost: ${PORT}`);
})