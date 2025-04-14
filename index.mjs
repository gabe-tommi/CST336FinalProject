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
    const name = req.query.name
    const genre = req.query.genre
    const studio = req.query.studio_name
    const address =req.query.address
    console.log(name+", "+genre+", "+studio+", "+address)
    res.render('addgame');
});

app.get('/findmap', async (req, res) => {
    const place = req.query.place; // Get the selected place from the query string
    console.log(`Selected place: ${place}`);
    const [rows] = await pool.query('SELECT * FROM studio');
    res.render('findmap', { studios: rows, place:place });
});

app.post('/addgame', async (req, res) => {
    const { name, genre, studio_name, address } = req.body;

    try {
        // Insert into video_games table
        const [result1] = await pool.query(
            `INSERT INTO video_games (game_name, genre, studio_name) VALUES (?, ?, ?)`,
            [name, genre, studio_name]
        );

        // Insert into studio table
        const [result2] = await pool.query(
            `INSERT INTO studio (studio_name, address) VALUES (?, ?)`,
            [studio_name, address]
        );

        console.log(`Game added: ${name}, Genre: ${genre}, Studio: ${studio_name}, Address: ${address}`);
        res.redirect('/'); // Redirect to the homepage or another page after successful insertion
    } catch (error) {
        console.error('Error adding game:', error);
        res.status(500).send('Error adding the game.');
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});