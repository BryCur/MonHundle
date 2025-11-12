drop table if exists game_sessions;
drop table if exists players;

create table if not exists players (
    id serial primary key,
    player_uid uuid unique not null,
    preferences json,
    last_connection timestamp default current_timestamp
);

create table if not exists game_sessions (
    id serial primary key,
    game_uid uuid unique not null,
    player_id integer not null references players(id),
    answer_monster_id integer not null references monsters(id),
    state text not null default 'ONGOING',
    guesses json not null default json('[]'),
    start_time timestamp not null default current_timestamp,
    last_update timestamp not null,
    end_time timestamp
);

create index game_sessions_player_id on game_sessions(player_id);