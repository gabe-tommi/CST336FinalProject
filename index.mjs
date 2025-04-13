import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

// For Express to get values using POST method
app.use(express.urlencoded({ extended: true }));

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: "jesusgarcialoyola.site",
    user: "jesusgar_final_project",
    password: "Jesus583213@",
    database: "jesusgar_final_project_336",
    connectionLimit: 10,
    waitForConnections: true
});

// Removed unused `conn` variable and ensured proper async/await usage
app.get('/', (req, res) => {
    res.send("Hello >3");
});

app.get('/studiomap', async(req, res) => {
    const [rows] = await pool.query('SELECT * FROM studio'); 
    console.log(rows)
    res.render('studiomap', { studios: rows });

});

app.get('/addgame', (req, res) => {
    res.render('addgame');
});

app.get('/findmap', async (req, res) => {
    const place = req.query.place; // Get the selected place from the query string
    console.log(`Selected place: ${place}`);
    const [rows] = await pool.query('SELECT * FROM studio');
    res.render('findmap', { studios: rows, place:place });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});