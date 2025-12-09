const MODE_CONFIG = {
  easy: { size: 6, subgridHeight: 2, subgridWidth: 3, clues: 20 },
  normal: { size: 9, subgridHeight: 3, subgridWidth: 3, clues: 30 },
};

function range(length) {
  return Array.from({ length }, (_, index) => index);
}

function shuffled(array) {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function shuffledGroupIndices(totalSize, groupSize) {
  const groups = shuffled(range(totalSize / groupSize));
  return groups.flatMap((group) =>
    shuffled(range(groupSize)).map((offset) => group * groupSize + offset),
  );
}

function deepClone(board) {
  return board.map((row) => [...row]);
}

function pattern(size, subgridHeight, subgridWidth, row, col) {
  return (subgridWidth * (row % subgridHeight) + Math.floor(row / subgridHeight) + col) % size;
}

function generateSolvedBoard(size, subgridHeight, subgridWidth) {
  const rowIndices = shuffledGroupIndices(size, subgridHeight);
  const colIndices = shuffledGroupIndices(size, subgridWidth);
  const numbers = shuffled(range(size)).map((value) => value + 1);

  return rowIndices.map((row) =>
    colIndices.map((col) => numbers[pattern(size, subgridHeight, subgridWidth, row, col)]),
  );
}

function carvePuzzle(board, clues) {
  const size = board.length;
  const totalCells = size * size;
  const maxRemovals = totalCells - clues;
  const puzzle = deepClone(board);

  let removed = 0;

  const removeCell = (row, col) => {
    if (puzzle[row][col] === null) {
      return false;
    }
    puzzle[row][col] = null;
    removed += 1;
    return true;
  };

  // Guarantee at least one blank per row.
  for (let row = 0; row < size && removed < maxRemovals; row += 1) {
    const filledCols = [];
    for (let col = 0; col < size; col += 1) {
      if (puzzle[row][col] !== null) {
        filledCols.push(col);
      }
    }
    if (filledCols.length === 0) continue;
    const col = filledCols[Math.floor(Math.random() * filledCols.length)];
    removeCell(row, col);
  }

  // Guarantee at least one blank per column.
  for (let col = 0; col < size && removed < maxRemovals; col += 1) {
    let hasBlank = false;
    for (let row = 0; row < size; row += 1) {
      if (puzzle[row][col] === null) {
        hasBlank = true;
        break;
      }
    }
    if (hasBlank) continue;

    const filledRows = [];
    for (let row = 0; row < size; row += 1) {
      if (puzzle[row][col] !== null) {
        filledRows.push(row);
      }
    }
    if (filledRows.length === 0) continue;
    const row = filledRows[Math.floor(Math.random() * filledRows.length)];
    removeCell(row, col);
  }

  // Finish random removals until we reach the target.
  while (removed < maxRemovals) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    if (removeCell(row, col)) {
      continue;
    }
  }

  return puzzle;
}

function findEmptyCell(board) {
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (!board[row][col]) {
        return { row, col };
      }
    }
  }
  return null;
}

export function isValidPlacement(board, row, col, value, subgridHeight, subgridWidth) {
  const size = board.length;
  for (let idx = 0; idx < size; idx += 1) {
    if (board[row][idx] === value && idx !== col) {
      return false;
    }
    if (board[idx][col] === value && idx !== row) {
      return false;
    }
  }

  const startRow = Math.floor(row / subgridHeight) * subgridHeight;
  const startCol = Math.floor(col / subgridWidth) * subgridWidth;

  for (let r = startRow; r < startRow + subgridHeight; r += 1) {
    for (let c = startCol; c < startCol + subgridWidth; c += 1) {
      if (board[r][c] === value && (r !== row || c !== col)) {
        return false;
      }
    }
  }

  return true;
}

export function solveBoard(board, subgridHeight, subgridWidth) {
  const working = deepClone(board);

  function backtrack() {
    const empty = findEmptyCell(working);
    if (!empty) {
      return true;
    }

    const { row, col } = empty;
    const size = working.length;

    for (let number = 1; number <= size; number += 1) {
      if (isValidPlacement(working, row, col, number, subgridHeight, subgridWidth)) {
        working[row][col] = number;
        if (backtrack()) {
          return true;
        }
        working[row][col] = null;
      }
    }

    return false;
  }

  const solved = backtrack();
  return { solved, board: working };
}

export function generatePuzzleByMode(mode) {
  const config = MODE_CONFIG[mode];
  if (!config) {
    throw new Error(`Unsupported mode: ${mode}`);
  }
  const { size, subgridHeight, subgridWidth, clues } = config;
  const solvedBoard = generateSolvedBoard(size, subgridHeight, subgridWidth);
  const puzzle = carvePuzzle(solvedBoard, clues);
  return {
    puzzle,
    solution: deepClone(solvedBoard),
    config,
  };
}

export function serializeKey(row, col) {
  return `${row}-${col}`;
}

export function collectConflicts(board, subgridHeight, subgridWidth) {
  const size = board.length;
  const conflicts = new Set();

  // Rows
  for (let row = 0; row < size; row += 1) {
    const seen = new Map();
    for (let col = 0; col < size; col += 1) {
      const value = board[row][col];
      if (!value) continue;
      if (seen.has(value)) {
        conflicts.add(serializeKey(row, col));
        conflicts.add(serializeKey(row, seen.get(value)));
      } else {
        seen.set(value, col);
      }
    }
  }

  // Columns
  for (let col = 0; col < size; col += 1) {
    const seen = new Map();
    for (let row = 0; row < size; row += 1) {
      const value = board[row][col];
      if (!value) continue;
      if (seen.has(value)) {
        conflicts.add(serializeKey(row, col));
        conflicts.add(serializeKey(seen.get(value), col));
      } else {
        seen.set(value, row);
      }
    }
  }

  // Subgrids
  for (let startRow = 0; startRow < size; startRow += subgridHeight) {
    for (let startCol = 0; startCol < size; startCol += subgridWidth) {
      const seen = new Map();
      for (let r = startRow; r < startRow + subgridHeight; r += 1) {
        for (let c = startCol; c < startCol + subgridWidth; c += 1) {
          const value = board[r][c];
          if (!value) continue;
          if (seen.has(value)) {
            const { row, col } = seen.get(value);
            conflicts.add(serializeKey(r, c));
            conflicts.add(serializeKey(row, col));
          } else {
            seen.set(value, { row: r, col: c });
          }
        }
      }
    }
  }

  return conflicts;
}

export function isBoardComplete(board, subgridHeight, subgridWidth) {
  const size = board.length;
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!board[row][col]) {
        return false;
      }
    }
  }
  return collectConflicts(board, subgridHeight, subgridWidth).size === 0;
}

export function formatElapsed(elapsedMs) {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export { MODE_CONFIG };
