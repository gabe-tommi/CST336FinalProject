import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

// putting below as a template for creating a pool later.
// const pool = mysql.createPool({
//     host: "gabedevspace.com",
//     user: "gabedevs_webuser",
//     password: "(+U%[VpVSy$-",
//     database: "gabedevs_quotes",
//     connectionLimit: 10,
//     waitForConnections: true
// });
// const conn = await pool.getConnection();

app.get('/', (req, res) => {
    
    res.render('landing');
});
