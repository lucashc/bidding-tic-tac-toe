var socket = io();
var victory_available = false;
function update_balances(bal){
  $('.moneyuser1').text(bal[0])
  $('.moneyuser2').text(bal[1])
}

function register_move(e){
  if ($('.move-mode').css('display') != 'none'){
    if ($(e.target).children('h1').text() == ''){
      let cell_name = $(e.target).prop('class').split(' ')[1].slice(-2)
      socket.emit('move', cell_name)
      $('.move-mode').hide();
    }
  }
}

function update_board(board){
  $('.move-mode-other').hide();
  let row = 0
  let column = 0
  $('.tile h1').each((elem) => {
    let element = $('.tile h1')[elem]
    $(element).text(board[row][column])
    column += 1
    if (column % 3 == 0 && column != 0){
      column = 0
      row += 1
    }
  });
  $('.bidding-box').show();
}

function victory(we){
  victory_available = true
  if (we){
    alert_user("You won!");
  }else{
    alert_user("You lost!");
  }
}

function alert_user(message) {
  $('.notify h1').text(message);
  $('.overlay').show();
}

$(document).ready(() => {
  $('.overlay').hide();
  $('.game').hide();
  $('.waiting').hide();
  $('.move-mode').hide();
  $('.move-mode-other').hide();
  $('.waiting-bid').hide();

  $('.overlay').click(() => {
    if (victory_available){
      $('.game').hide();
      $('.waiting').hide();
      $('.move-mode').hide();
      $('.move-mode-other').hide();
      $('.waiting-bid').hide();
      $('.sessioninput').show();
    }
    $('.overlay').hide();
  });

  socket.on("session in use", () => {
    alert_user("Session is already full");
    $('.game').hide();
    $('.sessioninput').show();
  });

  $('.button').click(() => {
    var ID = $('.session').val();
    socket.emit('register session', ID);
    $('.sessioninput').hide();
    $('.waiting').show();
  });
  socket.on('other player connected', () => {
    $('.waiting').hide();
    $('.game').show();
  });
  $('.bid').click(() => {
    let amount = $('.bidding').val();
    if (amount > Number($('.moneyuser1').text())){
      alert_user("You cannot bid more than you have")
    }else{
      socket.emit('bid', amount);
      $('.waiting-bid').show();
      $('.bidding-box').hide();
    }
  });
  socket.on('redo bid', () => {
    alert_user('You bid the same, rebid');
    $('.waiting-bid').hide();
    $('.bidding-box').show();
  });
  socket.on('bid made', (msg) => {
    $('.waiting-bid').hide();
    update_balances(msg['balance'])
    let biddings = msg['biddings']
    if (msg['winner']){
      alert_user("You won with: " + biddings[0].toString() + " against " + biddings[1].toString())
      $('.move-mode').show()
    }else{
      alert_user("You lost with: " + biddings[0].toString() + " against " + biddings[1].toString())
      $('.move-mode-other').show();
    }
  });
  $('.tile').click(register_move);
  socket.on('update board', update_board);
  socket.on('victory', victory);
});
