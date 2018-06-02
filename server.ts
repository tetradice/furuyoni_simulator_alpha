'use strict';

import * as express from 'express';
import * as socketIO from 'socket.io';
import * as path from 'path';
import * as redis from 'redis';
import * as randomstring from 'randomstring';

const RedisClient = redis.createClient(process.env.REDIS_URL);
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const MAIN_JS = path.join(__dirname, 'main.js');

const server = express()
  .set('views', __dirname + '/')
  .set('view engine', 'ejs')
  .use(express.static('public'))
  .use(express.static('node_modules'))
  .get('/main.js', (req, res) => res.sendFile(MAIN_JS) )
  .get('/', (req, res) => res.sendFile(INDEX) )
  .get('/b/:boardId/:side', (req, res) => res.render('board', {boardId: req.params.boardId, side: req.params.side}) )
  .post('/boards.create', (req, res) => {
    // 新しい卓IDを生成
    let boardId = randomstring.generate({
        length: 10
      , readable: true
    });

    // 卓を追加
    RedisClient.HSET('boards', boardId, JSON.stringify({created: new Date().toJSON()}));

    // 卓にアクセスするためのURLを生成
    let urlBase = req.protocol + '://' + req.hostname + ':' + PORT;
    let p1Url = `${urlBase}/b/${boardId}/p1`;
    let p2Url = `${urlBase}/b/${boardId}/p2`;
    let watchUrl = `${urlBase}/b/${boardId}/watch`;

    res.json({p1Url: p1Url, p2Url: p2Url, watchUrl: watchUrl});
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

io.on('connection', (socket) => {
  console.log(`Client connected - ${socket.id}`);
  socket.on('disconnect', () => console.log('Client disconnected'));

  // ボード情報を受信
  socket.on('send_board_to_server', (data) => {
    // 
    console.log('on send_board_to_server: ', data);
    let boardData = {
      body: data.board,
      updated: new Date(),
      logs: [],
      p1Name: 'ポン',
      p2Name: 'ポン2'
    };
    console.log('send: ', boardData);
    RedisClient.HSET('boards', data.boardId, JSON.stringify(boardData), (error, n) => {
      socket.broadcast.emit('send_board_to_client', boardData);
    });
    
  });
});

// setInterval(() => {
//   let count = RedisClient.INCR('counter', (error, n) => {
//     io.emit('time', n);
//   });
  
// }, 1000);