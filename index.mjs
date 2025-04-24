import { render } from 'ejs';
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

//Landing page render to then redirct once user clicks sign in or login


// For Express to get values using POST method
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse JSON bodies

// Create a MySQL connection pool

const pool = mysql.createPool({
    host: "jesusgarcialoyola.site",
    user: "jesusgar_final_project",
    password: "Jesus583213@",
    database: "jesusgar_final_project_336",
    connectionLimit: 10,
    waitForConnections: true
});


app.get('/', (req, res) => {
    
    res.render('landing');
});
//Goes to login page when user clicks login
app.get('/signin', (req, res) => {
    res.render('signin');
});
//Goes to signup page when user clicks sign up
app.get('/signup', (req, res) => {
    res.render('signup');
});
//search page when user clicks search for games
app.get('/search', async (req, res) => {
    let sea = req.query.query;
    console.log(sea)
    if(!sea) {
        sea = '';
    }
    const sql = `SELECT * FROM video_games WHERE game_name LIKE ?`;
    const [search] = await pool.query(sql, [`%${sea}%`]);

    res.render('gamesearch',{search});
});
// Connects gameSearch to the navbar and renders the page
app.get('/gamesearch',(req, res) => {
    let search=[];
    
    res.render('gamesearch.ejs', { search});
});

// Route to display studio map
app.get('/studiomap', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM studio');
        console.log(rows);
        res.render('studiomap', { studios: rows });
    } catch (error) {
        console.error('Error fetching studios:', error);
        res.status(500).send('Error fetching studios');
    }
});

// Route to render the add game form
app.get('/addgame', (req, res) => {
    res.render('addgame');
});

// Route to find a studio and display it on a map
app.get('/findmap', async (req, res) => {
    const place = req.query.place; // Get the selected place from the query string
    console.log(`Selected place: ${place}`);
    try {
        const [rows] = await pool.query('SELECT * FROM studio');
        res.render('findmap', { studios: rows, place: place });
    } catch (error) {
        console.error('Error fetching studios:', error);
        res.status(500).send('Error fetching studios');
    }
});

// Route to add a game
//  Route to add a game
app.post('/addgame', async (req, res) => {
    const { name, genre, studio_name, address } = req.body;

    try {
        // Insert into video_games table
        await pool.query(
            `INSERT INTO video_games (game_name, genre, studio_name) VALUES (?, ?, ?)`,
            [name, genre, studio_name]
        );

        // Insert into studio table
        await pool.query(
            `INSERT INTO studio (studio_name, address) VALUES (?, ?)`,
            [studio_name, address]
        );

        console.log(`Game added: ${name}, Genre: ${genre}, Studio: ${studio_name}, Address: ${address}`);
       res.render('addgame')
        // res.status(200).json({ success: 'Game added successfully' });
    } catch (error) {
        console.error('Error adding game:', error);
        res.render('home')
        // res.status(500).json({ error: 'Error adding game. Please try again.' });
    }
});

app.post('/favorite', async (req, res) => {
    const gameId = req.body.gameId; 
    const query = req.body.query; 
    const fav = req.body.favoriteGameId;
    if(fav ==0 || query == undefined || query == undefined){
        const sql = `SELECT * FROM video_games WHERE game_name LIKE ?`;
        const [search] = await pool.query(sql, [`%${query}%`]);
    

    }else{
        const sql = `INSERT IGNORE INTO favorite (user_id, video_game_id) VALUES (?, ?)`;
        [userId, videoGameId]
    }
    console.log(`Game ID: ${gameId}`);

    const sql = `SELECT * FROM video_games WHERE game_name LIKE ?`;
    const [search] = await pool.query(sql, [`%${query}%`]);


    res.render('gamesearch.ejs', { search, searchQuery:query});
});


// API route to search for studios by name or address
app.get('/api/studios', async (req, res) => {
    const searchTerm = req.query.q; // Get the search term from the query string

    try {
        // Query the database for studios matching the search term
        const [rows] = await pool.query(
            `SELECT * FROM studio WHERE studio_name LIKE ? OR address LIKE ?`,
            [`%${searchTerm}%`, `%${searchTerm}%`]
        );

        // Return the results as JSON
        res.json(rows);
    } catch (error) {
        console.error('Error searching for studios:', error);
        res.status(500).json({ error: 'Error searching for studios' });
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

