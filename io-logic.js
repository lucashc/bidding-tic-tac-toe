var socketIO = require('socket.io');
var io = socketIO();
var game = require('./playlogic');
//IO code
var games = {};
var game_ids = {};
/**
* game_ids = {user_id: [socket, game_id]}
* Following: game_id: {users: [user_id], board: [[]]}
*/

io.on('connection', (client) => {
  client.on('register session', (ID) => {
    if (ID.length < 0){return}
    //Check if game exists
    if (games.hasOwnProperty(ID)){
      //game exists
      //add user to it
      if (games[ID]['users'].length >= 2){
        client.emit("session in use");
      }else{
        games[ID]['users'].push(client.id);
        game_ids[client.id] = [client, ID];
        games[ID]['board'].ID2 = client.id
        games[ID]['board'].init_balance()
        for (let i of games[ID]['users']){
          game_ids[i][0].emit('other player connected');
        }
      }
    }else{
      games[ID] = {users: [client.id], board: new game()};
      games[ID]['board'].ID1 = client.id
      game_ids[client.id] = [client, ID]
    }
  });
  client.on('bid', (amount) => {
    let ID = game_ids[client.id][1]
    let current_game = games[ID]['board']
    if (current_game.make_bid(client.id, amount)){
      if (current_game.check_if_ready()){
        let winner = current_game.winner_bid()
        if (!winner){
          for (let i of games[ID]['users']){
            game_ids[i][0].emit('redo bid')
          }
          current_game.reset_biddings()
          return
        }
        current_game.apply_bid()
        for (let i of games[ID]['users']){
          //add amounts and do move
          let msg = {balance: current_game.get_balance(i), winner: false, biddings: current_game.get_biddings(i)}
          if (i == winner){
            msg['winner'] = true
          }
          //tell winner and do move
          game_ids[i][0].emit('bid made', msg);
        }
      }
    }
  });
  client.on('move', (cell) => {
    let ID = game_ids[client.id][1]
    let current_game = games[ID]['board']
    current_game.do_move(cell, client.id)
    let victory = current_game.victory()
    let send_victory = false
    if (victory != false){
      send_victory = true
    }
    for (let i of games[ID]['users']){
      let msg = current_game.get_board(i)
      game_ids[i][0].emit('update board', msg);
      if (send_victory){
        if (i == victory){
          game_ids[i][0].emit('victory', true);
        }else{
          game_ids[i][0].emit('victory', false);
        }
      }
    }
    if (victory != false){
      if (game_ids[client.id] != undefined){
        games[game_ids[client.id][1]]['users'].splice(games[game_ids[client.id][1]]['users'].indexOf(client.id), 1);
        if (games[game_ids[client.id][1]]['users'].length == 0) {
          delete games[game_ids[client.id][1]]
        }
        delete game_ids[client.id]
      }else{
        return
      }
    }
  });
  client.on('disconnect', () => {
    if (game_ids[client.id] != undefined){
      games[game_ids[client.id][1]]['users'].splice(games[game_ids[client.id][1]]['users'].indexOf(client.id), 1);
      if (games[game_ids[client.id][1]]['users'].length == 0) {
        delete games[game_ids[client.id][1]]
      }
      delete game_ids[client.id]
    }else{
      return
    }
  });
});

module.exports = io;
