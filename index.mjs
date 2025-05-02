import { render } from 'ejs';
import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
let userId;

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

// For Express to get values using POST method
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse JSON bodies

function userAuth(req, res, next){ // middleware function to ensure User Authentication
    if(req.session.userAuthenticated){
        next();
    }
    else{
        res.redirect('/');
    }
}

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
app.get('/signin', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let sql = `SELECT * FROM user WHERE username = ?`;
    await pool.query(sql, username);
    res.render('signin');
});
//Goes to signup page when user clicks sign up
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.post('/signup', async (req, res) => { // adds new users to DB
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let sql = `INSERT INTO user (username, password, email, first_name, last_name) 
                VALUES (?, ?, ?, ?, ?)`;
    let sqlParams = [username, password, email, firstname, lastname];
    await pool.query(sql, sqlParams);
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
app.post('/updateDB', async (req, res) => {
    const conn = await pool.getConnection();
    const sql = `UPDATE video_games 
                 SET game_name = ?, genre = ?, studio_name = ?
                 WHERE video_game_id = ?`;
    const params = [
        req.body.game_name,
        req.body.genre,
        req.body.studio_name,
        req.body.video_game_id
    ];
    await conn.query(sql, params);
    const sq12 = 'UPDATE studio SET address = ? WHERE studio_id = ?';
    const params2 =[
        req.body.address,
        req.body.studio_id
    ];
    await conn.query(sq12,params2)
    conn.release();
    res.redirect('/viewlist');
});
//route to viewlist
app.get('/viewlist', async(req, res) =>{
    try{
        const[rows] = await pool.query('SELECT video_games.video_game_id, video_games.game_name,video_games.genre,video_games.studio_name,studio.address,studio.studio_id FROM video_games INNER JOIN studio ON video_games.studio_name = studio.studio_name');
        console.log(rows);
        res.render('viewlist', {games: rows });
    
    }catch(error){
        console.error('Error fetching games:', error);
        res.status(500).send('Error fetching games');
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

app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/updateDB', (req, res) => {
    res.render('updateDB');
});