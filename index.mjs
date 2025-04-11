import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

// putting below as a template for creating a pool later.
const pool = mysql.createPool({
    host: "jesusgarcialoyola.site",
    user: "jesusgar_final_project",
    password: "Jesus583213@",
    database: "jesusgar_final_project_336",
    connectionLimit: 10,
    waitForConnections: true
});
const conn = await pool.getConnection();
