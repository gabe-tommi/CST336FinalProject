import express from 'express';
import mysql from 'mysql2/promise';
import session from 'express-session';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Middleware for parsing POST data
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse JSON bodies

// Session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

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

app.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    const userQ = `SELECT * FROM user WHERE username = ?`;
    try {
        const [user] = await pool.query(userQ, [username]);
        if (user.length > 0 && user[0].password === password) {
            req.session.userAuthenticated = true;
            req.session.userId = user[0].user_id;
            res.redirect('/home');
        } else {
            req.session.userAuthenticated = false;
            res.render('signin', { error: "Incorrect username or password" });
        }
    } catch (error) {
        console.error('Error during sign-in:', error);
        req.session.userAuthenticated = false;
        res.render('signin', { error: "Incorrect username or password" });
    }
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    const userQ = `SELECT * FROM user WHERE username = ?`;
    try {
        const [user] = await pool.query(userQ, [username]);
        if (user.length > 0 && user[0].password === password) {
            req.session.userAuthenticated = true;
            req.session.userId = user[0].user_id;
            console.log(`User ID set: ${req.session.userId}`); // Log user_id
            res.redirect('/home');
        } else {
            req.session.userAuthenticated = false;
            res.render('signin', { error: "Incorrect username or password" });
        }
    } catch (error) {
        console.error('Error during sign-in:', error);
        req.session.userAuthenticated = false;
        res.render('signin', { error: "Incorrect username or password" });
    }
});


app.get('/search', userAuth, async (req, res) => {
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

app.get('/gamesearch', userAuth, (req, res) => {
    res.render('gamesearch', { search: [] });
});

app.get('/studiomap', userAuth, async (req, res) => {
    try {
        const [studios] = await pool.query('SELECT * FROM studio');
        res.render('studiomap', { studios });
    } catch (error) {
        console.error('Error fetching studios:', error);
        res.status(500).send('Error fetching studios.');
    }
});

app.get('/updateDB', userAuth, async (req, res) => {
    const id = req.query.gameid;
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
            res.render('updateDB', { game: games[0] });
        } else {
            res.status(404).send('Game not found');
        }
    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).send('Error fetching game data.');
    }
});

app.post('/updateDB', userAuth, async (req, res) => {
    const { video_game_name, video_game_id, genre, studio_name, address, studio_id } = req.body;
    console.log( video_game_name, video_game_id, genre, studio_name[1], address, studio_id)
    try {
        const conn = await pool.getConnection();
        const updateGameSql = `UPDATE video_games SET game_name = ?, genre = ?, studio_name = ? WHERE video_game_id = ?`;
        await conn.query(updateGameSql, [video_game_name, genre, studio_name[1], video_game_id]);
        const updateStudioSql = `UPDATE studio SET studio_name = ?, address = ? WHERE studio_id = ?`;
        await conn.query(updateStudioSql, [studio_name[1], address, studio_id]);
        conn.release();
        res.redirect('/viewlist');
    } catch (error) {
        console.error('Error updating database:', error);
        res.status(500).send('Error updating database.');
    }
});

app.get('/addgame', userAuth, (req, res) => {
    res.render('addgame');
});

app.post('/addgame', userAuth, async (req, res) => {
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

app.get('/viewlist', userAuth, async (req, res) => {
    console.log(`Accessing user ID: ${req.session.userId}`); // Log user_id
    const sql = `
        SELECT 
            u.username,
            vg.game_name,
            vg.genre,
            vg.studio_name,
            vg.video_game_id
        FROM favorite f
        JOIN user u ON f.user_id = u.user_id
        JOIN video_games vg ON f.video_game_id = vg.video_game_id
        WHERE u.user_id = ?;
    `;
    try {
        const [games] = await pool.query(sql, [req.session.userId]);
        res.render('viewlist', { games });
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).send('Error fetching games.');
    }
});

app.get('/findmap', userAuth, async (req, res) => {
    const place = req.query.place;
    try {
        const [studios] = await pool.query('SELECT * FROM studio');
        res.render('findmap', { studios, place });
    } catch (error) {
        console.error('Error fetching studios:', error);
        res.status(500).send('Error fetching studios.');
    }
});


app.post('/favorite', userAuth, async (req, res) => {
    console.log(`Accessing user ID: ${req.session.userId}`); // Log user_id
    const { favorite } = req.body;

    try {
        if (!favorite) {
            return res.status(400).send('No favorite data provided.');
        }

        for (const [videoGameId, value] of Object.entries(favorite)) {
            if (value === 'yes') {
                const incrementedVideoGameId = parseInt(videoGameId, 10) + 1; // Add +1 to videoGameId
                console.log(`Adding favorite for user ID: ${req.session.userId}, video game ID: ${incrementedVideoGameId}`); // Log user_id and incremented video_game_id
                const sql = `INSERT IGNORE INTO favorite (user_id, video_game_id) VALUES (?, ?)`;
                await pool.query(sql, [req.session.userId, incrementedVideoGameId]);
            }
        }

        res.redirect('/gamesearch');
    } catch (error) {
        console.error('Error processing favorite:', error);
        res.status(500).send('Error processing favorite.');
    }
});

app.get('/api/studios', userAuth, async (req, res) => {
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

app.get('/home', userAuth, (req, res) => {
    res.render('home');
});


app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('Error logging out.');
        }
        res.redirect('/');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


app.post('/deleteGame', userAuth, async (req, res) => {
    const { video_game_id } = req.body;
    try {
        const deleteGameSql = `DELETE FROM favorite WHERE video_game_id = ?`;
        console.log(video_game_id);
        await pool.query(deleteGameSql, [video_game_id]);
        res.redirect('/viewlist');
    } catch (error) {
        console.error('Error deleting game:', error);
        res.status(500).send('Error deleting game. Please try again.');
    }
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