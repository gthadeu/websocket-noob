const express = require('express');
const http = require('http');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY, name TEXT UNIQUE)');
  db.run('CREATE TABLE IF NOT EXISTS teams (id INTEGER PRIMARY KEY, name TEXT UNIQUE)');
  db.run('CREATE TABLE IF NOT EXISTS scores (game_id INTEGER, team_id INTEGER, score INTEGER, UNIQUE(game_id, team_id))');

  db.run('INSERT OR IGNORE INTO games (name) VALUES (?)', ['Game 1']);
  db.run('INSERT OR IGNORE INTO games (name) VALUES (?)', ['Game 2']);
  db.run('INSERT OR IGNORE INTO teams (name) VALUES (?)', ['Team A']);
  db.run('INSERT OR IGNORE INTO teams (name) VALUES (?)', ['Team B']);
});

app.get('/scores/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  db.all('SELECT t.id AS team_id, s.score FROM teams t LEFT JOIN scores s ON t.id = s.team_id WHERE s.game_id = ?', [gameId], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao obter pontuações' });
    } else {
      res.json({ gameId, scores: rows });
    }
  });
});

app.post('/scores', (req, res) => {
  const { gameId, teamId, score } = req.body;
  db.run('INSERT OR REPLACE INTO scores (game_id, team_id, score) VALUES (?, ?, ?)', [gameId, teamId, score], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro ao atualizar a pontuação' });
    } else {
      res.json({ success: true });
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor está rodando na porta ${PORT}`);
});
