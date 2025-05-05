import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Middleware for parsing POST data
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse JSON bodies

// Middleware for user authentication
function userAuth(req, res, next) {
    if (req.session?.userAuthenticated) {
        next();
    } else {
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

// Routes
app.get('/', (req, res) => {
    res.render('landing');
});

app.get('/signin', (req, res) => {
    res.render('signin');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { username, password, email, firstname, lastname } = req.body;
    const sql = `INSERT INTO user (username, password, email, first_name, last_name) VALUES (?, ?, ?, ?, ?)`;
    const sqlParams = [username, password, email, firstname, lastname];
    try {
        await pool.query(sql, sqlParams);
        res.redirect('/signin');
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).send('Error signing up. Please try again.');
    }
});

app.get('/search', async (req, res) => {
    const query = req.query.query || '';
    const sql = `SELECT * FROM video_games WHERE game_name LIKE ?`;
    try {
        const [search] = await pool.query(sql, [`%${query}%`]);
        res.render('gamesearch', { search });
    } catch (error) {
        console.error('Error searching games:', error);
        res.status(500).send('Error searching games.');
    }
});

app.get('/gamesearch', (req, res) => {
    res.render('gamesearch', { search: [] });
});

app.get('/studiomap', async (req, res) => {
    try {
        const [studios] = await pool.query('SELECT * FROM studio');
        res.render('studiomap', { studios });
    } catch (error) {
        console.error('Error fetching studios:', error);
        res.status(500).send('Error fetching studios.');
    }
});

app.get('/updateDB', async (req, res) => {
    const id = req.query.gameid; // Retrieve game_id from query parameters
    try {
        const sql = `
            SELECT video_games.video_game_id, video_games.game_name, video_games.genre, 
                   video_games.studio_name, studio.address, studio.studio_id
            FROM video_games
            INNER JOIN studio ON video_games.studio_name = studio.studio_name
            WHERE video_games.video_game_id = ?
        `;
        const [games] = await pool.query(sql, [id]);
        if (games.length > 0) {
            const game = games[0]; // Get the first (and only) game
            // console.log(game)
            res.render('updateDB', { game });
        } else {
            res.status(404).send('Game not found');
        }
    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).send('Error fetching game data.');
    }
});

app.post('/updateDB', async (req, res) => {
    let studio_names = req.body.studio_name
    // let id = 
    // console.log(studio_names[1])
    const { video_game_name, video_game_id, genre, studio_name, address, studio_id } = req.body;

    if (!video_game_id) {
        return res.status(400).send('Missing video_game_id');
    }

    try {
        const conn = await pool.getConnection();

        // Update the video_games table
        const updateGameSql = `UPDATE video_games SET game_name = ?, genre = ?, studio_name = ? WHERE video_game_id = ?`;
        await conn.query(updateGameSql, [video_game_name, genre, studio_names[1], video_game_id]);

        // Update the studio table
        const updateStudioSql = `UPDATE studio SET studio_name = ?, address = ? WHERE studio_id = ?`;
        await conn.query(updateStudioSql, [studio_names[1],address, studio_id]);
        console.log(updateStudioSql)
        conn.release();
        res.redirect('/viewlist');
    } catch (error) {
        console.error('Error updating database:', error);
        res.status(500).send('Error updating database.');
    }
});

app.get('/addgame', (req, res) => {
    res.render('addgame');
});

app.post('/addgame', async (req, res) => {
    const { name, genre, studio_name, address } = req.body;
    try {
        await pool.query(`INSERT INTO video_games (game_name, genre, studio_name) VALUES (?, ?, ?)`, [name, genre, studio_name]);
        await pool.query(`INSERT INTO studio (studio_name, address) VALUES (?, ?)`, [studio_name, address]);
        res.redirect('/viewlist');
    } catch (error) {
        console.error('Error adding game:', error);
        res.status(500).send('Error adding game. Please try again.');
    }
});

app.get('/viewlist', async (req, res) => {
    const sql = `
        SELECT video_games.video_game_id, video_games.game_name, video_games.genre, 
               video_games.studio_name, studio.address, studio.studio_id
        FROM video_games
        INNER JOIN studio ON video_games.studio_name = studio.studio_name
    `;
    try {
        const [games] = await pool.query(sql);
        res.render('viewlist', { games });
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).send('Error fetching games.');
    }
});

app.get('/findmap', async (req, res) => {
    const place = req.query.place;
    try {
        const [studios] = await pool.query('SELECT * FROM studio');
        res.render('findmap', { studios, place });
    } catch (error) {
        console.error('Error fetching studios:', error);
        res.status(500).send('Error fetching studios.');
    }
});

app.post('/favorite', async (req, res) => {
    const { query, favorite } = req.body;
    console.log(req.session.userId);
    try {
        if (!query || !favorite) {
            const sql = `SELECT * FROM video_games WHERE game_name LIKE ?`;
            const [search] = await pool.query(sql, [`%${query}%`]);
            res.render('gamesearch', { search, searchQuery: query });
        } else {
            const sql = `INSERT IGNORE INTO favorite (user_id, video_game_id) VALUES (?, ?)`;
            await pool.query(sql, [req.session.userId, favorite]);
            res.redirect('/gamesearch');
        }
    } catch (error) {
        console.error('Error processing favorite:', error);
        res.status(500).send('Error processing favorite.');
    }
});

app.get('/api/studios', async (req, res) => {
    const searchTerm = req.query.q || '';
    try {
        const [studios] = await pool.query(
            `SELECT * FROM studio WHERE studio_name LIKE ? OR address LIKE ?`,
            [`%${searchTerm}%`, `%${searchTerm}%`]
        );
        res.json(studios);
    } catch (error) {
        console.error('Error searching for studios:', error);
        res.status(500).json({ error: 'Error searching for studios.' });
    }
});

app.get('/home', (req, res) => {
    res.render('home');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});