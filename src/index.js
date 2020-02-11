import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// 함수형 컴포넌트
// 보드판 블럭
function Square(props) {
  const [ count, setCount ] = useState(0)
  const classList = ['square'];

  if (props.value === 'X') {
    classList.push('redText');
  } else {
    classList.push('blueText');
  }

  if (props.value) {
    classList.push('active');
  }

  if (props.win) {
    classList.push('win');
  }

  const updateCount = () => {
    setCount(count + 1)
    props.onClick()
  }

  return (
    <button
      className={classList.join(' ')}
      onClick={updateCount}
      data-click-count={count}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  renderSquare(i) {
    console.log(this.props.pos, i)
    return (
      <Square
        value={this.props.squares[i]}
        win={~this.props.pos.indexOf(i)}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className='board-row'>
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className='board-row'>
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className='board-row'>
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // 보드판 기록
      history: [
        {
          squares: new Array(9).fill('')
        }
      ],
      // 차례 번호
      stepNumber: 0,
      // 다음이 X 차례인지 여부
      xIsNext: true
    }
  }

  init () {
    this.setState({
      history: [
        {
          squares: new Array(9).fill('')
        }
      ],
      stepNumber: 0,
      xIsNext: true
    });
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const w = calculateWinner(squares)

    if ((w && w.winner) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: [...history, ...[{ squares, }]],
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const w = calculateWinner(current.squares);

    const moves = history.map((_, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    let restart = null;
    if (w && w.winner) {
      restart = <button onClick={() => this.init()}>Restart</button>;
      
      if (w.winner === '-') {
        status = 'Draw';
      } else {
        status = `Winner: ${w.winner}`;
      }
    } else {
      status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    }

    return (
      <div className='game'>
        <div className='game-board'>
          <Board 
            squares={current.squares}
            pos={(w || {}).pos || []}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className='game-info'>
          <div>{status}</div>
          <ol>{moves}</ol>
          {restart}
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  // Check winner
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        pos: [a, b, c]
      }
    }
  }

  // In game
  for (let i of squares) {
    if (!i) {
      return {
        winner: null,
        pos: null
      };
    }
  }

  // Draw
  return {
    winner: '-',
    pos: null
  };
}
