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

function isValid(board, row, col, num) {
  const size = board.length;
  const subgridHeight = size === 9 ? 3 : 2;
  const subgridWidth = 3;

  // Check row and column
  for (let x = 0; x < size; x++) {
    if (board[row][x] === num) return false;
    if (board[x][col] === num) return false;
  }

  // Check subgrid
  const startRow = row - (row % subgridHeight);
  const startCol = col - (col % subgridWidth);
  for (let i = 0; i < subgridHeight; i++) {
    for (let j = 0; j < subgridWidth; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }
  return true;
}

// Backtracking solver that counts solutions
function countSolutions(board, limit = 2) {
  const size = board.length;
  let count = 0;

  function solve(currentBoard) {
    if (count >= limit) return; // Stop if we found enough solutions

    let row = -1;
    let col = -1;
    let isEmpty = false;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (currentBoard[i][j] === null) {
          row = i;
          col = j;
          isEmpty = true;
          break;
        }
      }
      if (isEmpty) break;
    }

    if (!isEmpty) {
      count++;
      return;
    }

    for (let num = 1; num <= size; num++) {
      if (isValid(currentBoard, row, col, num)) {
        currentBoard[row][col] = num;
        solve(currentBoard);
        currentBoard[row][col] = null; // Backtrack
        if (count >= limit) return;
      }
    }
  }

  solve(deepClone(board));
  return count;
}

// Helper to get the solution
function getSolution(board) {
  const size = board.length;
  const solutionBoard = deepClone(board);
  const subgridHeight = size === 9 ? 3 : 2;
  const subgridWidth = 3;

  function solve() {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (solutionBoard[row][col] === null) {
          for (let num = 1; num <= size; num++) {
            if (isValid(solutionBoard, row, col, num)) {
              solutionBoard[row][col] = num;
              if (solve()) return true;
              solutionBoard[row][col] = null;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  if (solve()) return solutionBoard;
  return null;
}

export function validateCustomGame(puzzle) {
  const size = puzzle.length;
  if (size !== 9) return { valid: false, message: "Board must be 9x9" }; // Only support 9x9 for custom as per screenshot

  // Check for obvious conflicts in initial state
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = puzzle[r][c];
      if (val !== null) {
        // Temporarily clear cell to check validity
        puzzle[r][c] = null;
        if (!isValid(puzzle, r, c, val)) {
          return { valid: false, message: "Initial puzzle contains conflicts" };
        }
        puzzle[r][c] = val;
      }
    }
  }

  const solutions = countSolutions(puzzle);
  if (solutions === 0) {
    return { valid: false, message: "Puzzle has no solution" };
  }
  if (solutions > 1) {
    return { valid: false, message: "Puzzle has multiple solutions (not unique)" };
  }

  const solution = getSolution(puzzle);
  return { valid: true, solution };
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
