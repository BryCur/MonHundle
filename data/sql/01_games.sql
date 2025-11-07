drop table if exists game_titles;

create table if not exists game_titles (
    id integer primary key,
    code varchar(10) unique not null,
    name varchar(100),
    generation integer,
    release_year integer
);

insert into game_titles -- only consider international releases, commented entries are japanese exclusives
(id, code, name, generation, release_year)
values
    (1, 'MH1', 'Monster Hunter', 1, 2004),
    -- (2, 'MHG', 'Monster Hunter G', 1, 2005),
    (3, 'MHF1', 'Monster Hunter Freedom', 1, 2005),
    -- (4, 'MH2', 'Monster Hunter 2', 2, 2006),
    (5, 'MHF2', 'Monster Hunter Freedom 2', 2, 2007),
    (6, 'MHFU', 'Monster Hunter Freedom Unite', 2, 2009),
    (7, 'MH3', 'Monster Hunter Tri', 3, 2010),
    -- (7, 'MHP3', 'Monster Hunter Portable 3rd', 3, 2010),
    (8, 'MH3U', 'Monster Hunter Tri Ultimate', 3, 2013),
    -- (9, 'MH4', 'Monster Hunter 4', 4, 2013),
    (9, 'MH4U', 'Monster Hunter 4 Ultimate', 4, 2015),
    (10, 'MHGen', 'Monster Hunter Generation', 4, 2016),
    (11, 'MHGU', 'Monster Hunter Generation Ultimate', 4, 2018),
    (12, 'MHWorld', 'Monster Hunter: World', 5, 2018),
    (13, 'MHWI', 'Monster Hunter World: Iceborn', 5, 2019),
    (14, 'MHR', 'Monster Hunter Rise', 5, 2021),
    (15, 'MHRS', 'Monster Hunter Rise: Sunbreak', 5, 2022),
    (16, 'MHWilds', 'Monster Hunter Wilds', 6, 2025)
;
    