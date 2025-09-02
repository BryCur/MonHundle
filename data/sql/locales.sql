drop table if exists locales;

create table if not exists locales (
    id integer primary key,
    code text unique,
    biomes text[] 
);

insert into locales (id, code, biomes) 
values 
    (1, 'verdant_hill', '{"forest", "highland"}'), -- Gen 1
    (2, 'old_jungle', '{"jungle"}'),
    (3, 'old_desert', '{"desert"}'),
    (4, 'old_swamp', '{"swamp"}'),
    (5, 'old_volcano', '{"volcano"}'),
    (6, 'fortress', '{"special"}'),
    (7, 'castle_shrade', '{"ruin", "special"}'),
    (8, 'battleground', '{"volcano", "special"}'),

    (9, 'snowy_mountains', '{"mountain", "snowfield"}'), -- Gen 2
    (10, 'jungle', '{"jungle"}'),
    (11, 'desert', '{"desert"}'),
    (12, 'swamp', '{"swamp"}'),
    (13, 'volcano', '{"volcano"}'),
    (14, 'town', '{"special"}'),
    (15, 'tower_1', '{"ruin"}'),
    (16, 'tower_2', '{"ruin", "special"}'),
    (17, 'snowy_mountain_peak', '{"mountain", "snowfield", "special"}'),
    (18, 'great_forest', '{"jungle"}'),

    (19, 'deserted_island', '{"ocean", }'), -- Gen 3
    (20, 'flooded_forest', '{"jungle", "swamp"}'),
    (21, 'sandy_plain', '{"desert", "savanna"}'),
    (22, 'tundra', '{"snowfield"}'),
    (23, 'volcano_3rd_gen', '{"volcano"}'),
    (24, 'underwater_ruins', '{"ocean", "ruin", "special"}'),
    (25, 'sacred_land', '{"volcano", "special"}'),
    (26, 'great_desert', '{"desert", "special"}'),
    (27, 'misty_peaks', '{"mountain"}'),
    (28, 'lava_canyon', '{"volcano", "special"}'),
    (29, 'polar_field', '{"snowflied", "special"}'),
    (30, 'tainted_sea', '{"special"}'),
    (31, 'sacred_pinnacle', '{"mountain", "special"}'),

    (32, 'ancestral_steppe', '{"highland", "ruin"}'), -- Gen 4
    (33, 'sunken_hollow', '{"caves"}'),
    (34, 'primal_forest', '{"forest", "jungle"}'),
    (35, 'frozen_seaway', '{"snowfield"}'),
    (36, 'volcanic_hollow', '{"cave", "volcano"}'),
    (37, 'heavens_mount', '{"mountain", "ruin"}'),
    (38, 'everwood', '{"forest", "special"}'),
    (39, 'tower_summit', '{"ruin", "special"}'),
    (40, 'sanctuary', '{"ruin", "special"}'), -- Arena style? for shagaru?
    (41, 'speartip_crag', '{"mountain", "special"}'),
    (42, 'ingle_isle', '{"volcano", "special"}'),
    (43, 'forlorn_citadel', '{"desert", "special"}'),

    (44, 'ancient_forest', '{"jungle"}'),  -- gen 5 
    (45, 'wildspire_waste', '{"desert", "cave"}'),
    (46, 'coral_highlands', '{"highland", "mountain"}'),
    (47, 'rotten_vale', '{"cave"}'),
    (48, 'elders_recess', '{"volcano"}'),
    (49, 'hoardfrost_reach', '{"mountain", "snowfield"}'),


;


