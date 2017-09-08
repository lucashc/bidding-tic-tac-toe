class TicTacToe {
  constructor(){
    this.balance = {}
    this.ready = [false, false];
    this.queue = [0, 0];
    this.board = [['','',''], ['','',''], ['','','']];
    this.ID1 = 0;
    this.ID2 = 0;
  }
  init_balance(){
    this.balance[this.ID1] = 100
    this.balance[this.ID2] = 100
  }
  make_bid(ID, bid){
    if (ID == this.ID1){
      this.queue[0] = Number(bid);
      this.ready[0] = true;
    }else if (ID == this.ID2){
      this.queue[1] = Number(bid);
      this.ready[1] = true;
    }else{
      return false;
    }
    return true;
  }

  check_if_ready(){
    return this.ready[0] && this.ready[1];
  }

  winner_bid(){
    if (this.queue[0] > this.queue[1]){
      return this.ID1
    }else if (this.queue[0] < this.queue[1]){
      return this.ID2
    }else{
      if (this.balance[this.ID1] > this.balance[this.ID2]){
        return this.ID1
      }else if (this.balance[this.ID1] < this.balance[this.ID2]){
        return this.ID2
      }else{
        return false
      }
    }
  }
  reset_biddings(){
    this.ready[0] = false
    this.ready[1] = false
  }
  get_balance(ID){
    if (ID == this.ID1){
      return [this.balance[this.ID1], this.balance[this.ID2]]
    }else if (ID == this.ID2){
      return [this.balance[this.ID2], this.balance[this.ID1]]
    }
  }
  get_biddings(ID){
    if (ID == this.ID1){
      return [this.queue[0], this.queue[1]]
    }else if (ID == this.ID2){
      return [this.queue[1], this.queue[0]]
    }
  }
  apply_bid(){
    this.balance[this.ID1] = Number(this.balance[this.ID1]) + Number(this.queue[1]) - Number(this.queue[0])
    this.balance[this.ID2] = Number(this.balance[this.ID2]) + Number(this.queue[0]) - Number(this.queue[1])
    this.ready[0] = false
    this.ready[1] = false
  }
  do_move(cell, ID){
    let pos = [Number(cell.split('')[0]), Number(cell.split('')[1])]
    this.board[pos[0]][pos[1]] = ID
  }
  get_board(ID){
    let board = []
    for (let i of this.board){
      let row = []
      for (let j of i){
        if (j == ID){
          row.push('X')
        }else if (j == ''){
          row.push('')
        }else{
          row.push('O')
        }
      }
      board.push(row)
    }
    return board
  }
  check_victory_id(id){
    let transpose = m => m[0].map((x,i) => m.map(x => x[i]))
    let to_check = Array(3).fill(id).toString()
    for (let i of this.board.concat(transpose(this.board))){
      if (to_check == i.toString()){
        return true
      }
    }
    if ([this.board[0][0], this.board[1][1], this.board[2][2]].toString() == to_check || [this.board[0][2], this.board[1][1], this.board[2][0]].toString() == to_check){
      return true
    }
    return false
  }
  victory(){
    if (this.check_victory_id(this.ID1)){
      return this.ID1
    }else if (this.check_victory_id(this.ID2)){
      return this.ID2
    }else{
      return false
    }
  }
}

module.exports = TicTacToe
