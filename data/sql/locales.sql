create table if not exists locales (
    id integer primary key,
    code varchar(25) unique,
    name varchar(100)
)