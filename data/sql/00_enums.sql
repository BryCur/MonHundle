---------------------------- classifications ------------------------------
-- describe a monster class (flying wyvern, leviathan, ...). does not include sub-specification such
-- as sub-species, rare species, etc.
drop table if exists classifications;

create table if not exists classifications (
    id integer primary key,
    code text unique
);


insert into classifications (id, code)
values 
    (0, 'amphibian'),
    (1, 'bird_wyvern'),
    (2, 'brute_wyvern'),
    (3, 'carapaceon'),
    (4, 'cephalopod'),
    (5, 'construct'),
    (6, 'demi_elder'),
    (7, 'elder_dragon'),
    (8, 'fanged_beast'),
    (9, 'fanged_wyvern'),
    (10, 'flying_wyvern'),
    (11, 'leviathan'),
    (12, 'lynian'),
    (13, 'neopteron'),
    (14, 'piscine_wyvern'),
    (15, 'relict'),
    (16, 'snake_wyvern'),
    (17, 'temnoceran'),
    (18, 'unknown');


---------------------------- biomes ------------------------------
-- lists the different kind of environments that could be present on a map
-- and that could be home to monsters
-- /!\ related to locales and monsters tables 
drop table if exists biomes;

create table if not exists biomes (
    id integer primary key,
    code text unique
);


insert into biomes (id, code)
values
    (0, 'cave'),
    (1, 'desert'),
    (2, 'forest'),
    (3, 'highland'),
    (4, 'mountain'),
    (5, 'aquatic'),
    (6, 'ruin'),
    (7, 'savanna'),
    (8, 'snowfield'),
    (9, 'special'),
    (10, 'unique'),
    (11, 'swamp'),
    (12, 'volcano');


---------------------------- afflictions ------------------------------
-- lists the ailments a monster can inflict
drop table if exists afflictions;

create table if not exists afflictions (
    id integer primary key,
    code text unique
);


insert into afflictions (id, code)
values
    (0, 'blast_blight'),
    (1, 'bleeding'),
    (2, 'bubble_blight'),
    (3, 'defense_down'),
    (4, 'dragon'),
    (5, 'fatigue'),
    (6, 'fire'),
    (7, 'frenzy_virus'),
    (8, 'hellfire_blight'),
    (9, 'ice'),
    (10, 'paralysis'),
    (11, 'poison'),
    (12, 'sleep'),
    (13, 'snowman'),
    (14, 'stench'),
    (15, 'stun'),
    (16, 'thunder'),
    (17, 'water'),
    (18, 'webbed');

---------------------------- weaknesses ------------------------------
-- lists the elements and status effects that could affect a monster
drop table if exists weaknesses;

create table if not exists weaknesses (
    id integer primary key,
    code text unique
);


insert into weaknesses (id, code)
values
    (0, 'fire'),
    (1, 'ice'),
    (2, 'thunder'),
    (3, 'water'),
    (4, 'dragon'),
    (5, 'paralysis'),
    (6, 'sleep'),
    (7, 'poison'),
    (8, 'blast'),
    (9, 'stun');

---------------------------- diets ------------------------------
-- lists the different diets for monsters (e.g. piscivorous, vegetarian, ...)
drop table if exists weaknesses;

create table if not exists weaknesses (
    id integer primary key,
    code text unique
);


insert into weaknesses (id, code)
values
    (0, 'fish'),
    (1, 'meat'),
    (2, 'plant'),
    (3, 'insect'),
    (4, 'omnivore'),
    (5, 'unknown'),
    (6, 'mineral'),
    (7, 'carcass');