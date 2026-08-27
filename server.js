const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log(`Игрок подключился: ${socket.id}`);

  // Создание комнаты (на случай генерации случайного стола)
  socket.on('create_room', (_, callback) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms[roomId] = { players: [socket.id] };
    socket.join(roomId);
    if (callback) callback({ success: true, roomId });
    console.log(`Комната создана: ${roomId}`);
  });

  // Подключение к комнате (поддерживает точный ID из ссылки для опоздавших)
  socket.on('join_room', (data, callback) => {
    // Поддерживаем формат как от объекта { roomId }, так и простой строкой
    let roomId = typeof data === 'object' && data !== null ? data.roomId : data;
    
    if (!roomId) {
      if (callback) callback({ success: false, message: 'Не указан ID комнаты' });
      return;
    }

    roomId = roomId.toUpperCase();

    // Если комнаты еще нет в памяти (например, ведущий создал её через ссылку), создаем автоматически
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [] };
    }

    // Добавляем игрока, если его еще нет в списке этой комнаты
    if (!rooms[roomId].players.includes(socket.id)) {
      rooms[roomId].players.push(socket.id);
    }

    socket.join(roomId);
    
    // Оповещаем всех участников в комнате, что зашел новый игрок (опоздавший)
    io.to(roomId).emit('player_joined', { players: rooms[roomId].players, socketId: socket.id });
    
    if (callback) callback({ success: true });
    console.log(`Игрок успешно вошел в комнату: ${roomId}`);
  });

  // Синхронизация ходов/действий в игре
  socket.on('make_move', ({ roomId, moveData }) => {
    if (roomId) {
      socket.to(roomId.toUpperCase()).emit('update_game', moveData);
    }
  });

  // Отключение игрока
  socket.on('disconnect', () => {
    console.log(`Игрок отключился: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});