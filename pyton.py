import random


class Board():
    def __init__(self):
        self.board = self.create_board()
        # Use: 0 = empty, 1 = player checker, 2 = AI checker
        # 3 = player king, 4 = AI king

    def create_board(self):
        board = [
            [0, 2, 0, 2, 0, 2, 0, 2],
            [2, 0, 2, 0, 2, 0, 2, 0],
            [0, 2, 0, 2, 0, 2, 0, 2],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0]
        ]
        return board

    def display(self):
        print("  0 1 2 3 4 5 6 7")
        print(" +-----------------+")
        for row in range(8):
            print(f"{row}|", end=" ")
            for col in range(8):
                piece = self.board[row][col]
                if piece == 0:
                    print(".", end=" ")
                elif piece == 1:
                    print("o", end=" ")
                elif piece == 2:
                    print("x", end=" ")
                elif piece == 3:
                    print("O", end=" ")  # Player king
                elif piece == 4:
                    print("X", end=" ")  # AI king
            print(f"|{row}")
        print(" +-----------------+")
        print("  0 1 2 3 4 5 6 7")

    def promote_kings(self):
        # Promote player pieces that reach row 0
        for col in range(8):
            if self.board[0][col] == 1:
                self.board[0][col] = 3  # Player king

        # Promote AI pieces that reach row 7
        for col in range(8):
            if self.board[7][col] == 2:
                self.board[7][col] = 4  # AI king


class AI():
    def __init__(self, board):
        self.board = board

    def find_multi_attacks(self, row, col, piece, visited=None):
        if visited is None:
            visited = set()

        moves = []

        # Regular piece or king
        if piece == 2:  # Regular AI piece
            # Regular pieces can attack in all four directions in Russian checkers
            directions = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
            for dr, dc in directions:
                mid_r, mid_c = row + dr, col + dc
                end_r, end_c = row + 2 * dr, col + 2 * dc

                if 0 <= end_r < 8 and 0 <= end_c < 8:
                    if ((self.board.board[mid_r][mid_c] == 1 or self.board.board[mid_r][mid_c] == 3) and
                            self.board.board[end_r][end_c] == 0):
                        if (end_r, end_c) not in visited:
                            visited.add((end_r, end_c))

                            # Make a hypothetical move to check further attacks
                            original_state = (
                            self.board.board[row][col], self.board.board[mid_r][mid_c], self.board.board[end_r][end_c])
                            self.board.board[row][col] = 0
                            self.board.board[mid_r][mid_c] = 0
                            self.board.board[end_r][end_c] = piece

                            further = self.find_multi_attacks(end_r, end_c, piece, visited.copy())

                            # Restore the board state
                            self.board.board[row][col], self.board.board[mid_r][mid_c], self.board.board[end_r][
                                end_c] = original_state

                            if further:
                                for path in further:
                                    moves.append([(row, col), (end_r, end_c)] + path[1:])
                            else:
                                moves.append([(row, col), (end_r, end_c)])
        elif piece == 4:  # King
            directions = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
            for dr, dc in directions:
                # Check all squares in this direction
                r, c = row + dr, col + dc
                while 0 <= r < 8 and 0 <= c < 8:
                    if self.board.board[r][c] == 0:
                        # Empty square, continue looking
                        r += dr
                        c += dc
                        continue

                    if self.board.board[r][c] == 1 or self.board.board[r][c] == 3:  # Found an opponent's piece
                        # Check if there's an empty square after the opponent's piece
                        r2, c2 = r + dr, c + dc
                        while 0 <= r2 < 8 and 0 <= c2 < 8:
                            if self.board.board[r2][c2] == 0:  # Empty landing spot
                                if (r2, c2) not in visited:
                                    visited.add((r2, c2))

                                    # Make a hypothetical move to check further attacks
                                    original_state = (
                                    self.board.board[row][col], self.board.board[r][c], self.board.board[r2][c2])
                                    self.board.board[row][col] = 0
                                    self.board.board[r][c] = 0
                                    self.board.board[r2][c2] = piece

                                    further = self.find_multi_attacks(r2, c2, piece, visited.copy())

                                    # Restore the board state
                                    self.board.board[row][col], self.board.board[r][c], self.board.board[r2][
                                        c2] = original_state

                                    if further:
                                        for path in further:
                                            moves.append([(row, col), (r2, c2)] + path[1:])
                                    else:
                                        moves.append([(row, col), (r2, c2)])
                            r2 += dr
                            c2 += dc
                    break  # Once we find any piece, stop looking in this direction

                r += dr
                c += dc

        return moves

    def best_attack(self):
        all_moves = []
        for row in range(8):
            for col in range(8):
                if self.board.board[row][col] == 2 or self.board.board[row][col] == 4:
                    chains = self.find_multi_attacks(row, col, self.board.board[row][col])
                    if chains:
                        all_moves.extend(chains)

        if all_moves:
            # In Russian checkers, the longest capture sequence is mandatory
            best_moves = []
            max_length = 0

            for move in all_moves:
                if len(move) > max_length:
                    max_length = len(move)
                    best_moves = [move]
                elif len(move) == max_length:
                    best_moves.append(move)

            # Randomly select among the best moves
            best = random.choice(best_moves)

            # Execute the chain
            r1, c1 = best[0]
            piece_type = self.board.board[r1][c1]  # Remember if it's a king

            for i in range(len(best) - 1):
                r1, c1 = best[i]
                r2, c2 = best[i + 1]

                # Find and remove captured piece
                dr = 1 if r2 > r1 else -1
                dc = 1 if c2 > c1 else -1

                r, c = r1 + dr, c1 + dc
                while r != r2 or c != c2:
                    if self.board.board[r][c] != 0:
                        self.board.board[r][c] = 0  # Capture the piece
                        break
                    r += dr
                    c += dc

                # Move the piece
                self.board.board[r1][c1] = 0
                self.board.board[r2][c2] = piece_type

            # Check for promotion after the move
            self.board.promote_kings()
            return True
        return False

    def fallback_move(self):
        if self.move_strategic():
            return
        self.random_move()

    def move_strategic(self):
        # First try to promote pieces close to promotion
        for row in range(6, 7):  # Check pieces close to promotion (rows 6 and 7)
            for col in range(8):
                if self.board.board[row][col] == 2:  # Regular AI piece
                    for dr, dc in [(1, -1), (1, 1)]:
                        new_row = row + dr
                        new_col = col + dc
                        if 0 <= new_row < 8 and 0 <= new_col < 8 and self.board.board[new_row][new_col] == 0:
                            self.board.board[row][col] = 0
                            self.board.board[new_row][new_col] = 2

                            # Check for promotion
                            if new_row == 7:
                                self.board.board[new_row][new_col] = 4  # Promote to king
                            return True

        # Try to move kings strategically
        for row in range(8):
            for col in range(8):
                if self.board.board[row][col] == 4:  # AI king
                    for dr, dc in [(-1, -1), (-1, 1), (1, -1), (1, 1)]:
                        # Kings can move any distance
                        for dist in range(1, 8):
                            new_row = row + dr * dist
                            new_col = col + dc * dist
                            if 0 <= new_row < 8 and 0 <= new_col < 8:
                                if self.board.board[new_row][new_col] == 0:
                                    # Check that path is clear
                                    path_clear = True
                                    for d in range(1, dist):
                                        r = row + dr * d
                                        c = col + dc * d
                                        if self.board.board[r][c] != 0:
                                            path_clear = False
                                            break

                                    if path_clear:
                                        self.board.board[row][col] = 0
                                        self.board.board[new_row][new_col] = 4
                                        return True
                                else:
                                    break  # Stop if we hit a piece

        # Try to advance regular pieces
        for row in range(7):  # Start from top to bottom, except last row
            for col in range(8):
                if self.board.board[row][col] == 2:
                    for dr, dc in [(1, -1), (1, 1)]:
                        new_row = row + dr
                        new_col = col + dc
                        if 0 <= new_row < 8 and 0 <= new_col < 8 and self.board.board[new_row][new_col] == 0:
                            self.board.board[row][col] = 0
                            self.board.board[new_row][new_col] = 2

                            # Check for promotion after the move
                            self.board.promote_kings()
                            return True
        return False

    def random_move(self):
        moves = []
        # Collect all possible moves for both regular pieces and kings
        for row in range(8):
            for col in range(8):
                if self.board.board[row][col] == 2:  # Regular AI piece
                    for dr, dc in [(1, -1), (1, 1)]:  # Can only move forward
                        new_row = row + dr
                        new_col = col + dc
                        if 0 <= new_row < 8 and 0 <= new_col < 8 and self.board.board[new_row][new_col] == 0:
                            moves.append(((row, col), (new_row, new_col), 2))
                elif self.board.board[row][col] == 4:  # AI king
                    for dr, dc in [(-1, -1), (-1, 1), (1, -1), (1, 1)]:  # Can move in any direction
                        for dist in range(1, 8):
                            new_row = row + dr * dist
                            new_col = col + dc * dist
                            if 0 <= new_row < 8 and 0 <= new_col < 8:
                                if self.board.board[new_row][new_col] == 0:
                                    # Check that path is clear
                                    path_clear = True
                                    for d in range(1, dist):
                                        r = row + dr * d
                                        c = col + dc * d
                                        if self.board.board[r][c] != 0:
                                            path_clear = False
                                            break

                                    if path_clear:
                                        moves.append(((row, col), (new_row, new_col), 4))
                                else:
                                    break  # Stop if we hit a piece

        if moves:
            move = random.choice(moves)
            start, end, piece_type = move
            self.board.board[start[0]][start[1]] = 0
            self.board.board[end[0]][end[1]] = piece_type

            # Check for promotion after the move
            self.board.promote_kings()


class Player():
    def __init__(self, board):
        self.board = board

    def find_multi_attacks(self, row, col, piece, visited=None):
        if visited is None:
            visited = set()

        moves = []

        # Regular piece or king
        if piece == 1:  # Regular player piece
            # Regular pieces can attack in all four directions in Russian checkers
            directions = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
            for dr, dc in directions:
                mid_r, mid_c = row + dr, col + dc
                end_r, end_c = row + 2 * dr, col + 2 * dc

                if 0 <= end_r < 8 and 0 <= end_c < 8:
                    if ((self.board.board[mid_r][mid_c] == 2 or self.board.board[mid_r][mid_c] == 4) and
                            self.board.board[end_r][end_c] == 0):
                        if (end_r, end_c) not in visited:
                            visited.add((end_r, end_c))

                            # Make a hypothetical move to check further attacks
                            original_state = (
                            self.board.board[row][col], self.board.board[mid_r][mid_c], self.board.board[end_r][end_c])
                            self.board.board[row][col] = 0
                            self.board.board[mid_r][mid_c] = 0
                            self.board.board[end_r][end_c] = piece

                            further = self.find_multi_attacks(end_r, end_c, piece, visited.copy())

                            # Restore the board state
                            self.board.board[row][col], self.board.board[mid_r][mid_c], self.board.board[end_r][
                                end_c] = original_state

                            if further:
                                for path in further:
                                    moves.append([(row, col), (end_r, end_c)] + path[1:])
                            else:
                                moves.append([(row, col), (end_r, end_c)])
        elif piece == 3:  # King
            directions = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
            for dr, dc in directions:
                # Check all squares in this direction
                r, c = row + dr, col + dc
                while 0 <= r < 8 and 0 <= c < 8:
                    if self.board.board[r][c] == 0:
                        # Empty square, continue looking
                        r += dr
                        c += dc
                        continue

                    if self.board.board[r][c] == 2 or self.board.board[r][c] == 4:  # Found an opponent's piece
                        # Check if there's an empty square after the opponent's piece
                        r2, c2 = r + dr, c + dc
                        while 0 <= r2 < 8 and 0 <= c2 < 8:
                            if self.board.board[r2][c2] == 0:  # Empty landing spot
                                if (r2, c2) not in visited:
                                    visited.add((r2, c2))

                                    # Make a hypothetical move to check further attacks
                                    original_state = (
                                    self.board.board[row][col], self.board.board[r][c], self.board.board[r2][c2])
                                    self.board.board[row][col] = 0
                                    self.board.board[r][c] = 0
                                    self.board.board[r2][c2] = piece

                                    further = self.find_multi_attacks(r2, c2, piece, visited.copy())

                                    # Restore the board state
                                    self.board.board[row][col], self.board.board[r][c], self.board.board[r2][
                                        c2] = original_state

                                    if further:
                                        for path in further:
                                            moves.append([(row, col), (r2, c2)] + path[1:])
                                    else:
                                        moves.append([(row, col), (r2, c2)])
                            r2 += dr
                            c2 += dc
                    break  # Once we find any piece, stop looking in this direction

                r += dr
                c += dc

        return moves

    def has_required_attack(self):
        # Check if player has any mandatory attacks
        for row in range(8):
            for col in range(8):
                if self.board.board[row][col] == 1 or self.board.board[row][col] == 3:
                    attacks = self.find_multi_attacks(row, col, self.board.board[row][col])
                    if attacks:
                        return True
        return False

    def make_move(self):
        if self.has_required_attack():
            print("You have mandatory attacks to make!")
            self.make_attack()
        else:
            self.make_normal_move()

        # Check for promotion after move
        self.board.promote_kings()

    def make_normal_move(self):
        while True:
            try:
                print("Enter your move:")
                n = int(input('Row: '))
                m = int(input('Column: '))

                piece = self.board.board[n][m]

                if piece != 1 and piece != 3:
                    print("That's not your piece! Try again.")
                    continue

                if piece == 3:  # King - can move any distance diagonally
                    print("Enter destination coordinates for your king:")
                    end_row = int(input('Destination row: '))
                    end_col = int(input('Destination column: '))

                    # Validate diagonal movement
                    if abs(end_row - n) != abs(end_col - m):
                        print("Kings must move diagonally! Try again.")
                        continue

                    # Check that destination is on the board and empty
                    if not (0 <= end_row < 8 and 0 <= end_col < 8 and self.board.board[end_row][end_col] == 0):
                        print("Invalid destination! Try again.")
                        continue

                    # Check that path is clear
                    dr = 1 if end_row > n else -1
                    dc = 1 if end_col > m else -1
                    path_clear = True

                    r, c = n + dr, m + dc
                    while r != end_row or c != end_col:
                        if self.board.board[r][c] != 0:
                            path_clear = False
                            break
                        r += dr
                        c += dc

                    if not path_clear:
                        print("Path is not clear! Try again.")
                        continue

                    # Valid move, execute it
                    self.board.board[n][m] = 0
                    self.board.board[end_row][end_col] = 3
                    break

                else:  # Regular piece - can only move one step diagonally forward
                    print("Choose direction (1=up-left, 2=up-right): ")
                    direction = int(input())

                    if direction == 1:
                        new_row, new_col = n - 1, m - 1
                    elif direction == 2:
                        new_row, new_col = n - 1, m + 1
                    else:
                        print("Invalid direction! Use 1 for up-left or 2 for up-right.")
                        continue

                    if 0 <= new_row < 8 and 0 <= new_col < 8 and self.board.board[new_row][new_col] == 0:
                        self.board.board[n][m] = 0
                        self.board.board[new_row][new_col] = 1
                        break
                    else:
                        print("Invalid move! Try again.")
            except (ValueError, IndexError):
                print("Invalid input! Try again.")

    def make_attack(self):
        all_moves = []
        for row in range(8):
            for col in range(8):
                if self.board.board[row][col] == 1 or self.board.board[row][col] == 3:
                    chains = self.find_multi_attacks(row, col, self.board.board[row][col])
                    if chains:
                        all_moves.extend(chains)

        if all_moves:
            # In Russian checkers, the longest capture sequence is mandatory
            max_length = max(len(move) for move in all_moves)
            best_moves = [move for move in all_moves if len(move) == max_length]

            print("\nAvailable attack chains:")
            valid_indices = []
            idx = 1
            for i, chain in enumerate(all_moves):
                if len(chain) == max_length:
                    print(f"{idx}: {chain}")
                    valid_indices.append(i)
                    idx += 1

            while True:
                try:
                    choice = int(input("Choose attack chain: ")) - 1
                    if 0 <= choice < len(valid_indices):
                        chain = all_moves[valid_indices[choice]]
                        r1, c1 = chain[0]
                        piece_type = self.board.board[r1][c1]  # Remember if it's a king

                        for i in range(len(chain) - 1):
                            r1, c1 = chain[i]
                            r2, c2 = chain[i + 1]

                            # Find and remove captured piece for kings or regular pieces
                            dr = 1 if r2 > r1 else -1
                            dc = 1 if c2 > c1 else -1

                            r, c = r1 + dr, c1 + dc
                            while r != r2 or c != c2:
                                if self.board.board[r][c] != 0:
                                    self.board.board[r][c] = 0  # Capture the piece
                                    break
                                r += dr
                                c += dc

                            # Move the piece
                            self.board.board[r1][c1] = 0
                            self.board.board[r2][c2] = piece_type
                        break
                    else:
                        print("Invalid choice! Try again.")
                except ValueError:
                    print("Please enter a number!")


def check_game_over(board):
    # Check if either player has no pieces left or no valid moves
    player_pieces = 0
    ai_pieces = 0

    for row in range(8):
        for col in range(8):
            if board.board[row][col] == 1 or board.board[row][col] == 3:
                player_pieces += 1
            elif board.board[row][col] == 2 or board.board[row][col] == 4:
                ai_pieces += 1

    if player_pieces == 0:
        return "AI"
    if ai_pieces == 0:
        return "Player"

    # Check if AI has no valid moves
    ai = AI(board)
    ai_has_moves = False

    # Check for mandatory captures first
    for row in range(8):
        for col in range(8):
            if board.board[row][col] == 2 or board.board[row][col] == 4:
                if ai.find_multi_attacks(row, col, board.board[row][col]):
                    ai_has_moves = True
                    break

    if not ai_has_moves:
        # Check for regular moves if no captures
        for row in range(8):
            for col in range(8):
                if board.board[row][col] == 2:  # Regular piece
                    for dr, dc in [(1, -1), (1, 1)]:
                        new_row, new_col = row + dr, col + dc
                        if 0 <= new_row < 8 and 0 <= new_col < 8 and board.board[new_row][new_col] == 0:
                            ai_has_moves = True
                            break
                elif board.board[row][col] == 4:  # King
                    for dr, dc in [(-1, -1), (-1, 1), (1, -1), (1, 1)]:
                        for dist in range(1, 8):
                            new_row = row + dr * dist
                            new_col = col + dc * dist
                            if not (0 <= new_row < 8 and 0 <= new_col < 8):
                                break
                            if board.board[new_row][new_col] != 0:
                                break
                            ai_has_moves = True
                            break

    if not ai_has_moves:
        return "Player"

    # Check if player has no valid moves
    player = Player(board)
    player_has_moves = False

    # Check for mandatory captures first
    for row in range(8):
        for col in range(8):
            if board.board[row][col] == 1 or board.board[row][col] == 3:
                if player.find_multi_attacks(row, col, board.board[row][col]):
                    player_has_moves = True
                    break

    if not player_has_moves:
        # Check for regular moves if no captures
        for row in range(8):
            for col in range(8):
                if board.board[row][col] == 1:  # Regular piece
                    for dr, dc in [(-1, -1), (-1, 1)]:
                        new_row, new_col = row + dr, col + dc
                        if 0 <= new_row < 8 and 0 <= new_col < 8 and board.board[new_row][new_col] == 0:
                            player_has_moves = True
                            break
                elif board.board[row][col] == 3:  # King
                    for dr, dc in [(-1, -1), (-1, 1), (1, -1), (1, 1)]:
                        for dist in range(1, 8):
                            new_row = row + dr * dist
                            new_col = col + dc * dist
                            if not (0 <= new_row < 8 and 0 <= new_col < 8):
                                break
                            if board.board[new_row][new_col] != 0:
                                break
                            player_has_moves = True
                            break

    if not player_has_moves:
        return "AI"

    return None  # Game continues


def main():
    main_board = Board()
    main_board.display()
    player1 = Player(main_board)
    bot = AI(main_board)

    while True:
        print("\nPlayer's turn:")
        player1.make_move()
        main_board.display()

        # Check if game is over after player's move
        result = check_game_over(main_board)
        if result:
            print(f"\n{result} wins!")
            break

        print("\nAI's turn:")
        if not bot.best_attack():
            bot.fallback_move()
        main_board.display()

        # Check if game is over after AI's move
        result = check_game_over(main_board)
        if result:
            print(f"\n{result} wins!")
            break


if __name__ == "__main__":
    main()