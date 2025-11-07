drop table if exists players;
drop table if exists game_sessions;

create table if not exists players (
    id serial primary key,
    player_uid uuid unique not null,
    preferences json                   
);

create table if not exists game_sessions (
    id serial primary key,
    game_uid uuid unique not null,
    player_id integer not null references players(id),
    answer_monster_id integer not null references monsters(id),
    state text default 'ONGOING',
    guesses json
);
