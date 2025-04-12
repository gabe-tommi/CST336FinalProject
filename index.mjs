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

app.get('/studiomap', (req, res) => {
    res.render('studiomap');
});

app.get('/findmap', (req, res) => {
    res.render('findmap.ejs');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});