const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose();


const app = express();
app.use(cors())
const server = http.createServer(app);
const io = socketIO(server,{
  cors: {
    origin : '*',
    methods : [
      'GET', 'POST'
    ]
  }
});

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


io.on('connection', (socket) => {

  console.log('Um cliente se conectou.');

  
  socket.on('updateScore', ({ gameId, teamId, score }) => {
    
    db.run('INSERT OR REPLACE INTO scores (game_id, team_id, score) VALUES (?, ?, ?)', [gameId, teamId, score], (err) => {
      if (err) {
        console.error(err.message);
      } else {
        
        db.all('SELECT t.id AS team_id, s.score FROM teams t LEFT JOIN scores s ON t.id = s.team_id WHERE s.game_id = ?', [gameId], (err, rows) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log("==>", score)
            io.emit('updateScores', { gameId, scores: rows });
          }
        });
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Um cliente se desconectou.');
  });
});


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor está rodando na porta ${PORT}`);
});
