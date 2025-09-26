DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    wins INTEGER DEFAULT 0 CHECK (wins >= 0),
    losses INTEGER DEFAULT 0 CHECK (losses >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    player1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    player2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    winner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
    board TEXT DEFAULT '["","","","","","","","",""]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,

    CONSTRAINT check_different_players CHECK (player1_id != player2_id),
    CONSTRAINT check_winner_is_player CHECK (
        winner_id IS NULL OR
        winner_id = player1_id OR
        winner_id = player2_id
    ),
    CONSTRAINT check_finished_at CHECK (
        (status = 'finished' AND finished_at IS NOT NULL) OR
        (status != 'finished' AND finished_at IS NULL)
    )
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_wins ON users(wins DESC);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_created_at ON games(created_at DESC);
CREATE INDEX idx_games_finished_at ON games(finished_at DESC);
CREATE INDEX idx_games_player1 ON games(player1_id);
CREATE INDEX idx_games_player2 ON games(player2_id);
CREATE INDEX idx_games_winner ON games(winner_id);

CREATE OR REPLACE VIEW ranking_view AS
SELECT
    ROW_NUMBER() OVER (ORDER BY u.wins DESC, (u.wins::float / NULLIF(u.wins + u.losses, 0)) DESC) as position,
    u.id,
    u.username,
    u.wins,
    u.losses,
    (u.wins + u.losses) as total_games,
    CASE
        WHEN (u.wins + u.losses) > 0 THEN ROUND(CAST((u.wins::float / (u.wins + u.losses)) * 100 AS NUMERIC), 2)
        ELSE 0
    END as win_rate
FROM users u
WHERE (u.wins + u.losses) > 0
ORDER BY u.wins DESC, win_rate DESC;

CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'finished' AND OLD.status != 'finished' THEN
        IF NEW.winner_id IS NOT NULL THEN
            UPDATE users
            SET wins = wins + 1
            WHERE id = NEW.winner_id;

            UPDATE users
            SET losses = losses + 1
            WHERE id = (CASE
                WHEN NEW.winner_id = NEW.player1_id THEN NEW.player2_id
                ELSE NEW.player1_id
            END);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_stats ON games;
CREATE TRIGGER trigger_update_stats
    AFTER UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

COMMIT;