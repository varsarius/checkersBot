#include <SFML/Graphics.hpp>
#include <SFML/System.hpp>
#include <array>
#include <vector>
#include <memory>
#include <set>
#include <random>
#include <cmath>

// Constants
const int WINDOW_WIDTH = 1024;
const int WINDOW_HEIGHT = 768;
const int BOARD_SIZE = 8;
const float BOARD_PIX = 580.f;
const float TILE_SIZE = BOARD_PIX / BOARD_SIZE;
const float BOARD_OFFSET_X = 5.f;
const float BOARD_OFFSET_Y = 20.f;

enum PieceType { EMPTY = 0, PLAYER = 1, AI_PIECE = 2, PLAYER_KING = 3, AI_KING = 4 };

// ---- Board Logic ----
class Board {
public:
    std::array<std::array<int, BOARD_SIZE>, BOARD_SIZE> grid;
    Board() { reset(); }
    void reset() {
        int arr[BOARD_SIZE][BOARD_SIZE] = {
            {0,2,0,2,0,2,0,2},
            {2,0,2,0,2,0,2,0},
            {0,2,0,2,0,2,0,2},
            {0,0,0,0,0,0,0,0},
            {0,0,0,0,0,0,0,0},
            {1,0,1,0,1,0,1,0},
            {0,1,0,1,0,1,0,1},
            {1,0,1,0,1,0,1,0},
        };
        for(int r=0;r<BOARD_SIZE;++r)
            for(int c=0;c<BOARD_SIZE;++c)
                grid[r][c] = arr[r][c];
    }
    int get(int r,int c) const { return grid[r][c]; }
    void set(int r,int c,int v) { grid[r][c]=v; }
    std::unique_ptr<Board> clone() const {
        auto b = std::make_unique<Board>(); b->grid = grid; return b;
    }
    void promoteKings() {
        for(int c=0;c<BOARD_SIZE;++c) {
            if(grid[0][c]==PLAYER)    grid[0][c]=PLAYER_KING;
            if(grid[7][c]==AI_PIECE)  grid[7][c]=AI_KING;
        }
    }
};

// ---- AI Logic ----
class AI {
public:
    Board& board;
    AI(Board& b): board(b) {}
    bool isEnemy(int x) const { return x==PLAYER||x==PLAYER_KING; }
    std::vector<std::vector<sf::Vector2i>> findMultiAttacks(int r,int c,std::set<std::pair<int,int>> visited,const Board& b) const;
    std::vector<sf::Vector2i> getRandomMove() const {
        std::vector<sf::Vector2i> moves;
        for(int r=0;r<BOARD_SIZE;++r) for(int c=0;c<BOARD_SIZE;++c) {
            int v=board.get(r,c); if(v!=AI_PIECE&&v!=AI_KING) continue;
            std::vector<sf::Vector2i> dirs = (v==AI_KING)
                ? std::vector<sf::Vector2i>{{-1,-1},{-1,1},{1,-1},{1,1}}
                : std::vector<sf::Vector2i>{{1,-1},{1,1}};
            for(auto d:dirs) {
                int nr=r+d.x,nc=c+d.y;
                if(nr>=0&&nr<BOARD_SIZE&&nc>=0&&nc<BOARD_SIZE&&board.get(nr,nc)==EMPTY)
                    return {{r,c},{nr,nc}};
            }
        }
        return {};
    }
    std::vector<sf::Vector2i> getMoveChain() const {
        std::vector<std::vector<sf::Vector2i>> caps;
        for(int r=0;r<BOARD_SIZE;++r) for(int c=0;c<BOARD_SIZE;++c) {
            int v=board.get(r,c); if(v!=AI_PIECE&&v!=AI_KING) continue;
            auto ch=findMultiAttacks(r,c,{},board);
            caps.insert(caps.end(),ch.begin(),ch.end());
        }
        if(!caps.empty()) {
            size_t maxL=0; for(auto& c:caps) maxL=std::max(maxL,c.size());
            std::vector<std::vector<sf::Vector2i>> best;
            for(auto& c:caps) if(c.size()==maxL) best.push_back(c);
            std::mt19937 rng(std::random_device{}());
            return best[rng()%best.size()];
        }
        return getRandomMove();
    }
};

std::vector<std::vector<sf::Vector2i>> AI::findMultiAttacks(int r,int c,std::set<std::pair<int,int>> visited,const Board& b) const {
    int piece=b.get(r,c); bool king=(piece==AI_KING);
    std::vector<sf::Vector2i> dirs{{-1,-1},{-1,1},{1,-1},{1,1}};
    std::vector<std::vector<sf::Vector2i>> out;
    for(auto d:dirs) {
        int mr=r+d.x,mc=c+d.y,er=r+2*d.x,ec=c+2*d.y;
        if(er<0||er>=BOARD_SIZE||ec<0||ec>=BOARD_SIZE) continue;
        if(isEnemy(b.get(mr,mc))&&b.get(er,ec)==EMPTY) {
            auto key=std::make_pair(er,ec); if(visited.count(key)) continue;
            auto nv=visited; nv.insert(key);
            auto cb=b.clone(); cb->set(r,c,EMPTY); cb->set(mr,mc,EMPTY); cb->set(er,ec,piece);
            auto fut=findMultiAttacks(er,ec,nv,*cb);
            if(!fut.empty()) for(auto& chain:fut) {
                std::vector<sf::Vector2i> cand; cand.push_back({r,c}); cand.push_back({er,ec});
                cand.insert(cand.end(), chain.begin()+1, chain.end()); out.push_back(cand);
            } else out.push_back({{r,c},{er,ec}});
        }
    }
    return out;
}

// ---- Player Logic ----
class PlayerLogic {
public:
    Board& board;
    PlayerLogic(Board& b): board(b) {}
    bool isEnemy(int x) const { return x==AI_PIECE||x==AI_KING; }
    std::vector<std::vector<sf::Vector2i>> findMultiAttacks(int r,int c,std::set<std::pair<int,int>> visited,const Board& b) const;
    bool hasMandatory() const {
        for(int r=0;r<BOARD_SIZE;++r) for(int c=0;c<BOARD_SIZE;++c) {
            int p=board.get(r,c);
            if((p==PLAYER||p==PLAYER_KING)&&!findMultiAttacks(r,c,{},board).empty()) return true;
        }
        return false;
    }
    std::vector<sf::Vector2i> getMoveChain(sf::Vector2i s, sf::Vector2i e) const {
        auto ch=findMultiAttacks(s.x,s.y,{},board);
        for(auto& c:ch) if(c.size()>1&&c[1]==e) return c;
        if(!hasMandatory()) {
            int p=board.get(s.x,s.y);
            if(board.get(e.x,e.y)==EMPTY) {
                if(p==PLAYER) {
                    if(e.x==s.x-1&&std::abs(e.y-s.y)==1) return {s,e};
                } else if(p==PLAYER_KING) {
                    int dx=e.x-s.x, dy=e.y-s.y;
                    if(std::abs(dx)==std::abs(dy)) {
                        int sx=dx>0?1:-1, sy=dy>0?1:-1; bool clear=true;
                        for(int i=1;i<std::abs(dx);++i)
                            if(board.get(s.x+i*sx,s.y+i*sy)!=EMPTY){clear=false;break;}
                        if(clear) return {s,e};
                    }
                }
            }
        }
        return {};
    }
};
std::vector<std::vector<sf::Vector2i>> PlayerLogic::findMultiAttacks(int r,int c,std::set<std::pair<int,int>> visited,const Board& b) const {
    int piece=b.get(r,c); bool king=(piece==PLAYER_KING);
    std::vector<sf::Vector2i> dirs{{-1,-1},{-1,1},{1,-1},{1,1}};
    std::vector<std::vector<sf::Vector2i>> out;
    for(auto d:dirs) {
        int mr=r+d.x,mc=c+d.y,er=r+2*d.x,ec=c+2*d.y;
        if(er<0||er>=BOARD_SIZE||ec<0||ec>=BOARD_SIZE) continue;
        if(isEnemy(b.get(mr,mc))&&b.get(er,ec)==EMPTY) {
            auto key=std::make_pair(er,ec); if(visited.count(key)) continue;
            auto nv=visited; nv.insert(key);
            auto cb=b.clone(); cb->set(r,c,EMPTY); cb->set(mr,mc,EMPTY); cb->set(er,ec,piece);
            auto fut=findMultiAttacks(er,ec,nv,*cb);
            if(!fut.empty()) for(auto& chain:fut) {
                std::vector<sf::Vector2i> cand; cand.push_back({r,c}); cand.push_back({er,ec});
                cand.insert(cand.end(), chain.begin()+1, chain.end()); out.push_back(cand);
            } else out.push_back({{r,c},{er,ec}});
        }
    }
    return out;
}

// ---- UI Piece ----
class Piece : public sf::Drawable {
public:
    sf::Sprite sprite;
    sf::Vector2i gridPos;
    bool selected=false;
    Piece(sf::Texture& tex, sf::Vector2i gp): sprite(tex), gridPos(gp) {
        float scale=(TILE_SIZE-10.f)/tex.getSize().x;
        sprite.setScale({scale,scale}); updatePosition();
    }
    void updatePosition(){ sprite.setPosition({BOARD_OFFSET_X+gridPos.y*TILE_SIZE+5.f, BOARD_OFFSET_Y+gridPos.x*TILE_SIZE+5.f}); }
    virtual void draw(sf::RenderTarget& t, sf::RenderStates s) const override { t.draw(sprite,s); }
};

// ---- Sync Pieces ----
void syncPieces(const Board& board, std::vector<Piece>& pieces, std::array<sf::Texture,5>& tex) {
    pieces.clear();
    for(int r=0;r<BOARD_SIZE;++r) for(int c=0;c<BOARD_SIZE;++c) {
        int v=board.get(r,c);
        if(v!=EMPTY) pieces.emplace_back(tex[v], sf::Vector2i(r,c));
    }
}

int main() {
    sf::RenderWindow window({WINDOW_WIDTH,WINDOW_HEIGHT}, "Checkers");
    // Load textures (ensure these files exist in working directory)
    std::array<sf::Texture,5> tex;
    tex[EMPTY].create(0,0);
    tex[PLAYER].loadFromFile("white_piece.png");
    tex[AI_PIECE].loadFromFile("black_piece.png");
    tex[PLAYER_KING].loadFromFile("white_king.png");
    tex[AI_KING].loadFromFile("black_king.png");

    Board board;
    AI ai(board);
    PlayerLogic pl(board);
    std::vector<Piece> pieces;
    syncPieces(board, pieces, tex);

    bool playerTurn = true;
    sf::Vector2i selected(-1,-1);

    while(window.isOpen()) {
        sf::Event e;
        while(window.pollEvent(e)) {
            if(e.type==sf::Event::Closed) window.close();
            if(e.type==sf::Event::MouseButtonPressed && e.mouseButton.button==sf::Mouse::Left) {
                int mx=e.mouseButton.x - BOARD_OFFSET_X;
                int my=e.mouseButton.y - BOARD_OFFSET_Y;
                int c=mx/TILE_SIZE, r=my/TILE_SIZE;
                if(r>=0&&r<BOARD_SIZE&&c>=0&&c<BOARD_SIZE) {
                    if(playerTurn) {
                        if(selected.x<0) {
                            if(board.get(r,c)==PLAYER||board.get(r,c)==PLAYER_KING) selected={r,c};
                        } else {
                            auto chain=pl.getMoveChain(selected, {r,c});
                            if(!chain.empty()) {
                                for(int i=0;i+1<chain.size();++i) {
                                    auto a=chain[i], b=chain[i+1];
                                    board.set(a.x,a.y,EMPTY);
                                    board.set(b.x,b.y, board.get(a.x,a.y));
                                }
                                board.promoteKings();
                                syncPieces(board,pieces,tex);
                                playerTurn=false;
                            }
                            selected={-1,-1};
                        }
                    }
                }
            }
        }

        if(!playerTurn) {
            auto chain=ai.getMoveChain();
            if(!chain.empty()) {
                for(int i=0;i+1<chain.size();++i) {
                    auto a=chain[i], b=chain[i+1];
                    board.set(a.x,a.y,EMPTY);
                    board.set(b.x,b.y, board.get(a.x,a.y));
                }
                board.promoteKings();
                syncPieces(board,pieces,tex);
            }
            playerTurn=true;
        }

        window.clear(sf::Color(50,50,50));
        // draw board
        for(int r=0;r<BOARD_SIZE;++r) for(int c=0;c<BOARD_SIZE;++c) {
            sf::RectangleShape tile({TILE_SIZE,TILE_SIZE});
            tile.setPosition({BOARD_OFFSET_X+c*TILE_SIZE, BOARD_OFFSET_Y+r*TILE_SIZE});
            tile.setFillColor(((r+c)%2)==0?sf::Color::White:sf::Color::Black);
            window.draw(tile);
        }
        // draw pieces
        for(auto& p: pieces) window.draw(p);
        window.display();
    }
    return 0;
}
