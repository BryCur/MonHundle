drop table if exists locales_biomes;
drop table if exists locales;

create table if not exists locales (
    id integer primary key,
    code text unique not null 
);

insert into locales (id, code) 
values 
    (1, 'verdant_hill'),-- Gen 1
    (2, 'old_jungle'),
    (3, 'old_desert'),
    (4, 'old_swamp'),
    (5, 'old_volcano'),
    (6, 'fortress'),
    (7, 'castle_shrade'),
    (8, 'battleground'),
    (9, 'snowy_mountains'),-- Gen 2
    (10, 'jungle'),
    (11, 'desert'),
    (12, 'swamp'),
    (13, 'volcano'),
    (14, 'town'),
    (15, 'tower_1'),
    (16, 'tower_2'),
    (17, 'snowy_mountain_peak'),
    (18, 'great_forest'),
    (19, 'deserted_island'),-- Gen 3
    (20, 'flooded_forest'),
    (21, 'sandy_plain'),
    (22, 'tundra'),
    (23, 'volcano_3rd_gen'),
    (24, 'underwater_ruins'),
    (25, 'sacred_land'),
    (26, 'great_desert'),
    (27, 'misty_peaks'),
    (28, 'lava_canyon'),
    (29, 'polar_field'),
    (30, 'tainted_sea'),
    (31, 'sacred_pinnacle'),
    (32, 'ancestral_steppe'),-- Gen 4
    (33, 'sunken_hollow'),
    (34, 'primal_forest'),
    (35, 'frozen_seaway'),
    (36, 'volcanic_hollow'),
    (37, 'heavens_mount'),
    (38, 'everwood'),
    (39, 'tower_summit'),
    (40, 'sanctuary'),
    (41, 'speartip_crag'),
    (42, 'ingle_isle'),
    (43, 'forlorn_citadel'),
    (44, 'ancient_forest'), -- gen 5 
    (45, 'wildspire_waste'),
    (46, 'coral_highlands'),
    (47, 'rotten_vale'),
    (48, 'elders_recess'),
    (49, 'hoardfrost_reach'),
    (50, 'everstream'),
    (51, 'confluence_of_fates'),
    (52, 'caverns_of_el_dorado'),
    (53, 'origin_isle'),
    (54, 'shrine_ruins'),
    (55, 'frost_islands'),
    (56, 'lava_caverns'),
    (57, 'citadel'),
    (58, 'coral_palace'),
    (59, 'yawning_abyss'),
    (60, 'windward_plains'), -- gen 6
    (61, 'scarlet_forest'),
    (62, 'oilwell_basin'),
    (63, 'iceshard_cliffs'),
    (64, 'ruins_of_wyveria'),
    (65, 'rimechain_peak'),
    (66, 'dragontorch_shrine');

---------------------------- relations -----------------------------
-- biomes 

create table if not exists locales_biomes (
    locale_id integer not null references locales(id),
    biome_id integer not null references biomes(id),
    PRIMARY KEY (locale_id, biome_id)
);

insert into locales_biomes (locale_id, biome_id)
    select 1 as locale_id, id as biome_id from biomes where code in ('forest', 'highland') -- dant_hill
    union all select 2 as locale_id, id as biome_id from biomes where code in ('forest', 'aquatic') -- _jungle
    union all select 3 as locale_id, id as biome_id from biomes where code in ('forest', 'aquatic') -- _desert
    union all select 4 as locale_id, id as biome_id from biomes where code in ('swamp') -- _swamp
    union all select 5 as locale_id, id as biome_id from biomes where code in ('volcano') -- _volcano
    union all select 6 as locale_id, id as biome_id from biomes where code in ('special') -- tress
    union all select 7 as locale_id, id as biome_id from biomes where code in ('ruin', 'special') -- tle_shrade
    union all select 8 as locale_id, id as biome_id from biomes where code in ('volcano', 'special') -- tleground
    union all select 9 as locale_id, id as biome_id from biomes where code in ('mountain', 'snowfield') -- wy_mountains 
    union all select 10 as locale_id, id as biome_id from biomes where code in ('forest', 'aquatic') -- jungle
    union all select 11 as locale_id, id as biome_id from biomes where code in ('desert') -- desert
    union all select 12 as locale_id, id as biome_id from biomes where code in ('swamp') -- swamp
    union all select 13 as locale_id, id as biome_id from biomes where code in ('volcano') -- volcano
    union all select 14 as locale_id, id as biome_id from biomes where code in ('special') -- town
    union all select 15 as locale_id, id as biome_id from biomes where code in ('ruin') -- tower_1
    union all select 16 as locale_id, id as biome_id from biomes where code in ('ruin', 'special') -- tower_2
    union all select 17 as locale_id, id as biome_id from biomes where code in ('mountain', 'snowfield', 'special') -- snowy_mountain_peak
    union all select 18 as locale_id, id as biome_id from biomes where code in ('forest', 'aquatic') -- great_forest
    union all select 19 as locale_id, id as biome_id from biomes where code in ('aquatic') -- deserted_island
    union all select 20 as locale_id, id as biome_id from biomes where code in ('forest', 'aquatic', 'swamp') -- flooded_forest
    union all select 21 as locale_id, id as biome_id from biomes where code in ('desert', 'savanna') -- sandy_plain
    union all select 22 as locale_id, id as biome_id from biomes where code in ('snowfield') -- tundra
    union all select 23 as locale_id, id as biome_id from biomes where code in ('volcano') -- volcano_3rd_gen
    union all select 24 as locale_id, id as biome_id from biomes where code in ('aquatic', 'ruin', 'special') -- underwater_ruins
    union all select 25 as locale_id, id as biome_id from biomes where code in ('volcano', 'special') -- sacred_land
    union all select 26 as locale_id, id as biome_id from biomes where code in ('desert', 'special') -- great_desert
    union all select 27 as locale_id, id as biome_id from biomes where code in ('mountain') -- misty_peaks
    union all select 28 as locale_id, id as biome_id from biomes where code in ('volcano', 'special') -- lava_canyon
    union all select 29 as locale_id, id as biome_id from biomes where code in ('snowflied', 'special') -- polar_field
    union all select 30 as locale_id, id as biome_id from biomes where code in ('special') -- tainted_sea
    union all select 31 as locale_id, id as biome_id from biomes where code in ('mountain', 'special') -- sacred_pinnacle
    union all select 32 as locale_id, id as biome_id from biomes where code in ('highland', 'ruin') -- ancestral_steppe
    union all select 33 as locale_id, id as biome_id from biomes where code in ('caves') -- sunken_hollow
    union all select 34 as locale_id, id as biome_id from biomes where code in ('forest', 'forest', 'aquatic') -- primal_forest
    union all select 35 as locale_id, id as biome_id from biomes where code in ('snowfield') -- frozen_seaway
    union all select 36 as locale_id, id as biome_id from biomes where code in ('cave', 'volcano') -- volcanic_hollow
    union all select 37 as locale_id, id as biome_id from biomes where code in ('mountain', 'ruin') -- heavens_mount
    union all select 38 as locale_id, id as biome_id from biomes where code in ('forest', 'special') -- everwood
    union all select 39 as locale_id, id as biome_id from biomes where code in ('ruin', 'special') -- tower_summit
    union all select 40 as locale_id, id as biome_id from biomes where code in ('ruin', 'special') -- sanctuary
    union all select 41 as locale_id, id as biome_id from biomes where code in ('mountain', 'special') -- speartip_crag
    union all select 42 as locale_id, id as biome_id from biomes where code in ('volcano', 'special') -- ingle_isle
    union all select 43 as locale_id, id as biome_id from biomes where code in ('desert', 'special') -- forlorn_citadel
    union all select 44 as locale_id, id as biome_id from biomes where code in ('forest') -- ancient_forest  
    union all select 45 as locale_id, id as biome_id from biomes where code in ('desert', 'cave') -- wildspire_waste
    union all select 46 as locale_id, id as biome_id from biomes where code in ('highland', 'mountain', 'unique') -- coral_highlands
    union all select 47 as locale_id, id as biome_id from biomes where code in ('cave', 'unique') -- rotten_vale
    union all select 48 as locale_id, id as biome_id from biomes where code in ('volcano', 'cave') -- elders_recess
    union all select 49 as locale_id, id as biome_id from biomes where code in ('mountain', 'snowfield') -- hoardfrost_reach
    union all select 50 as locale_id, id as biome_id from biomes where code in ('special', 'volcano') -- everstream
    union all select 51 as locale_id, id as biome_id from biomes where code in ('special', 'cave', 'unique') -- confluence_of_fates
    union all select 52 as locale_id, id as biome_id from biomes where code in ('special', 'cave', 'volcano') -- caverns_of_el_dorado
    union all select 53 as locale_id, id as biome_id from biomes where code in ('special', 'unique') -- origin_isle
    union all select 54 as locale_id, id as biome_id from biomes where code in ('forest') -- shrine_ruins
    union all select 55 as locale_id, id as biome_id from biomes where code in ('snowfield', 'cave') -- frost_islands
    union all select 56 as locale_id, id as biome_id from biomes where code in ('volcano', 'aquatic', 'cave') -- lava_caverns
    union all select 57 as locale_id, id as biome_id from biomes where code in ('swamp', 'mountain', 'ruins') -- citadel
    union all select 58 as locale_id, id as biome_id from biomes where code in ('ruin', 'unique') -- coral_palace
    union all select 59 as locale_id, id as biome_id from biomes where code in ('special', 'ruin') -- yawning_abyss
    union all select 60 as locale_id, id as biome_id from biomes where code in ('savanna', 'desert') -- windward_plains 
    union all select 61 as locale_id, id as biome_id from biomes where code in ('forest', 'aquatic', 'ruin') -- scarlet_forest
    union all select 62 as locale_id, id as biome_id from biomes where code in ('cave', 'volcano') -- oilwell_basin
    union all select 63 as locale_id, id as biome_id from biomes where code in ('mountain', 'ruin', 'snowfield') -- iceshard_cliffs
    union all select 64 as locale_id, id as biome_id from biomes where code in ('ruin', 'cave", unique}') -- ruins_of_wyveria
    union all select 65 as locale_id, id as biome_id from biomes where code in ('ruin', 'mountain', 'snowfield', 'special') -- rimechain_peak
    union all select 66 as locale_id, id as biome_id from biomes where code in ('ruin', 'special') -- dragontorch_shrine
;

create or replace view locales_v as 
    select 
        locales.id, 
        locales.code, 
        string_agg(biomes.code, ', ' order by biomes.code) as biome_list
    from locales
    join locales_biomes on locales.id = locales_biomes.locale_id
    join biomes on locales_biomes.biome_id = biomes.id
    group by locales.id, locales.code
