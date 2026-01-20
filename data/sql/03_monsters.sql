drop table if exists monsters_classifications;
drop table if exists monsters_afflictions;
drop table if exists monsters_biomes;
drop table if exists monsters_weaknesses;
drop table if exists monsters_gametitles;
drop table if exists monsters;

create table if not exists monsters (
    id serial primary key,
    code varchar(50) unique not null,
    generation integer,
    threat_level integer
);

-- habitats, calssification, afflictions, weaknesses, and diets all have dedicated tables

insert into monsters (code, generation, threat_level)
values
    ('abyssal_lagiacrus', 3, 6), -- stronger than base monster
    ('acidic_glavenus', 4, 5),
    ('agnaktor', 3, 4),
    ('ahtal_ka', 4, 8),
    ('ajarakan', 6, 3),
    ('akantor', 2, 8),
    ('aknosom', 5, 2),
    ('alatreon', 3, 9),
    ('almudron', 5, 4),
    ('amatsu', 3, 8),
    -- ('ancient_leshen', 5, 1), -- collab? 
    ('anjanath', 5, 4),
    ('arkveld', 6, 6),
    ('arzuros', 3, 2),
    ('ash_kecha_wacha', 4, 2),
    ('ashen_lao_shan_lung', 1, 8),
    ('astalos', 4, 5),
    ('aurora_somnacanth', 5, 2),
    ('azure_rathalos', 1, 5),
    ('balahara', 6, 2),
    ('baleful_gigginox', 3, 3),
    ('banbaro', 5, 3),
    ('barioth', 3, 4),
    ('barroth', 3, 3),
    ('basarios', 1, 3),
    ('bazelgeuse', 5, 5),
    -- ('behemoth', 0, 1), -- colab? 
    ('beotodus', 5, 3),
    ('berserk_tetsucabra', 4, 3), -- more dangerous than base monster
    ('bishaten', 5, 2),
    ('black_diablos', 1, 5),
    ('black_gravios', 1, 5),
    ('blackveil_vaal_hazak', 5, 7),
    ('blangonga', 2, 3),
    ('blood_orange_bishaten', 5, 3),
    ('bloodbath_diablos', 4, 6),
    ('blue_yian_kut_ku', 1, 2),
    ('boltreaver_astalos', 4, 5),
    ('brachydios', 3, 5),
    ('brute_tigrex', 2, 5),
    ('bulldrome', 2, 1),
    ('ceadeus', 3, 8),
    ('cephadrome', 1, 1),
    ('chameleos', 2, 7),
    ('chaotic_gore_magala', 4, 7),
    ('chatacabra', 6, 1),
    ('congalala', 2, 1),
    ('copper_blangonga', 2, 3),
    ('coral_pukei_pukei', 5, 2),
    ('crimson_fatalis', 1, 9),
    ('crimson_glow_valstrax', 5, 7),
    ('crimson_qurupeco', 3, 2),
    ('crystalbeard_uragaan', 4, 4),
    ('dah_ren_mohran', 4, 8),
    ('daimyo_hermitaur', 2, 2),
    ('dalamadur', 4, 8),
    ('deadeye_yian_garuga', 4, 4),
    ('desert_seltas', 4, 2),
    ('desert_seltas_queen', 4, 4),
    ('deviljho', 3, 6),
    ('diablos', 1, 5),
    ('dire_miralis', 3, 9),
    ('dodogama', 5, 1),
    ('doshaguma', 6, 3),
    ('dreadking_rathalos', 4, 5),
    ('dreadqueen_rathian', 4, 4),
    ('drilltusk_tetsucabra', 4, 3), -- stronger than regular individual
    ('duramboros', 3, 4),
    ('ebony_odogaron', 5, 5),
    ('elderfrost_gammoth', 4, 5),
    ('emerald_congalala', 2, 2),
    ('espinas', 5, 5),
    ('fatalis', 1, 9),
    ('flaming_espinas', 5, 5),
    ('frostfang_barioth', 5, 5), -- stronger than regular individual
    ('fulgur_anjanath', 5, 4),
    ('furious_rajang', 2, 6),
    ('gaismagorm', 5, 8),
    ('gammoth', 4, 5),
    ('garangolm', 5, 4),
    ('gendrome', 1, 1),
    ('giadrome', 2, 1),
    ('gigginox', 3, 3),
    ('glacial_agnaktor', 3, 4),
    ('glavenus', 4, 5),
    ('gobul', 3, 2),
    ('gogmazios', 4, 8),
    ('gold_rathian', 1, 6),
    ('goldbeard_ceadeus', 3, 8),
    ('gore_magala', 4, 6),
    ('goss_harag', 5, 3),
    ('gravios', 1, 5),
    ('great_baggi', 3, 1),
    ('great_girros', 5, 1),
    ('great_izuchi', 5, 1),
    ('great_jaggi', 3, 1),
    ('great_jagras', 5, 1),
    ('great_maccao', 4, 1),
    ('great_wroggi', 3, 1),
    ('green_nargacuga', 3, 5),
    ('green_plesioth', 1, 3),
    ('guardian_arkveld', 6, 6),
    ('guardian_doshaguma', 6, 3),
    ('guardian_ebony_odogaron', 6, 4),
    ('guardian_fulgur_anjanath', 6, 4),
    ('guardian_rathalos', 6, 5),
    ('grimclaw_tigrex', 4, 6),
    ('gypceros', 1, 2),
    ('hallowed_jhen_mohran', 3, 8),
    ('hellblade_glavenus', 4, 6), -- stronger than regular individual
    ('hirabami', 6, 3),
    ('hypnocatrice', 2, 2),
    ('iodrome', 1, 1),
    ('ivory_lagiacrus', 3, 5),
    ('jade_barroth', 3, 3),
    ('jhen_mohran', 3, 8),
    ('jin_dahaad', 6, 7),
    ('jyuratodus', 5, 3),
    ('kecha_wacha', 4, 2),
    ('khezu', 1, 3),
    ('king_shakalaka', 2, 1),
    ('kirin', 1, 7),
    ('kulu_ya_ku', 5, 1),
    ('kulve_taroth', 5, 8),
    ('kushala_daora', 2, 7),
    ('lagiacrus', 3, 5),
    ('lagombi', 3, 2),
    ('lala_barina', 6, 3),
    ('lao_shan_lung', 1, 8),
    ('lavasioth', 2, 4),
    ('legiana', 5, 5),
    -- ('leshen', 0, 1), -- collab?
    ('lucent_nargacuga', 3, 5),
    ('lunagaron', 5, 4),
    ('lunastra', 2, 7),
    ('magma_almudron', 5, 4),
    ('magnamalo', 5, 5),
    ('malfestio', 4, 2),
    ('malzeno', 5, 7),
    ('mizutsune', 4, 5),
    ('molten_tigrex', 4, 6),
    ('monoblos', 1, 4),
    ('najarala', 4, 3),
    ('nakarkos', 4, 8),
    ('namielle', 5, 7),
    ('nargacuga', 2, 5),
    ('narwa_the_allmother', 5, 7),
    ('nergigante', 5, 7),
    ('nerscylla', 4, 3),
    ('nibelsnarf', 3, 2),
    ('nightcloak_malfestio', 4, 2),
    ('nightshade_paolumu', 5, 3),
    ('nu_udra', 6, 5),
    ('odogaron', 5, 4),
    ('old_fatalis', 2, 9),
    ('oroshi_kirin', 4, 7),
    ('paolumu', 5, 3),
    ('pink_rathian', 1, 4),
    ('plesioth', 1, 3),
    ('plum_daimyo_hermitaur', 2, 2),
    ('primordial_malzeno', 5, 7),
    ('pukei_pukei', 5, 2),
    ('purple_gypceros', 1, 2),
    ('purple_ludroth', 3, 2),
    ('pyre_rakna_kadaki', 5, 4),
    ('quematrice', 6, 1),
    ('qurupeco', 3, 2),
    ('radobaan', 5, 4),
    ('raging_brachydios', 4, 6),
    ('rajang', 2, 6),
    ('rakna_kadaki', 5, 4),
    ('rathalos', 1, 5),
    ('rathian', 1, 4),
    ('red_khezu', 1, 3),
    ('redhelm_arzuros', 4, 3), -- stronger than regular individual
    ('rey_dau', 6, 5),
    ('rompopolo', 6, 2),
    ('royal_ludroth', 3, 2),
    ('ruby_basarios', 4, 3),
    ('ruiner_nergigante', 5, 7),
    ('rust_duramboros', 3, 4),
    ('rustrazor_ceanataur', 4, 4),
    ('safi_jiiva', 5, 7),
    ('sand_barioth', 3, 4),
    ('savage_deviljho', 3, 6),
    ('scarred_yian_garuga', 1, 4),
    ('scorned_magnamalo', 5, 8),
    ('seething_bazelgeuse', 5, 5),
    ('seltas', 4, 2),
    ('seltas_queen', 4, 4),
    ('seregios', 4, 5),
    ('shagaru_magala', 4, 7),
    ('shah_dalamadur', 4, 8),
    ('shara_ishvalda', 5, 8),
    ('shen_gaoren', 2, 8),
    ('shogun_ceanataur', 2, 4),
    ('shrieking_legiana', 5, 5),
    ('shrouded_nerscylla', 4, 3),
    ('silver_rathalos', 1, 6), -- stronger than regular individual
    ('silverwind_nargacuga', 4, 6), -- stronger than regular individual
    ('snowbaron_lagombi', 4, 3), -- stronger than regular individual
    ('somnacanth', 5, 2),
    ('soulseer_mizutsune', 4, 5),
    ('steel_uragaan', 3, 4),
    ('stonefist_hermitaur', 4, 3), -- stronger than regular individual
    ('stygian_zinogre', 3, 5),
    ('teostra', 2, 7),
    ('terra_shogun_ceanataur', 2, 4),
    ('tetranadon', 5, 3),
    ('tetsucabra', 4, 2),
    ('thunder_serpent_narwa', 5, 8),
    ('thunderlord_zinogre', 4, 6), -- stronger than regular individual
    ('tidal_najarala', 4, 3),
    ('tigerstripe_zamtrios', 4, 2),
    ('tigrex', 2, 5),
    ('tobi_kadachi', 5, 2),
    ('tzitzi_ya_ku', 5, 2),
    ('ukanlos', 2, 8),
    ('uragaan', 3, 4),
    ('uth_duna', 6, 5),
    ('vaal_hazak', 5, 7),
    ('valstrax', 4, 7),
    ('velkhana', 5, 7),
    ('velocidrome', 1, 1),
    ('vespoid_queen', 1, 1),
    ('violet_mizutsune', 5, 5),
    ('viper_tobi_kadachi', 5, 3), -- stronger than regular individual
    ('volvidon', 3, 2),
    ('white_monoblos', 1, 4),
    ('wind_serpent_ibushi', 5, 8),
    ('xeno_jiiva', 5, 8),
    ('xu_wu', 6, 4),
    ('yama_tsukami', 2, 8),
    ('yian_garuga', 2, 4),
    ('yian_kut_ku', 1, 2),
    ('zamtrios', 4, 2),
    ('zinogre', 3, 5),
    ('zoh_shia', 6, 8),
    ('zorah_magdaros', 5, 8)
;

---------------------------- classification -----------------------------

create table if not exists monsters_classifications (
    monster_id integer not null references monsters(id),
    classification_id integer not null references  classifications(id),
    primary key(monster_id, classification_id)
);

insert into monsters_classifications (classification_id, monster_id)
    -- amphibians 7
    select 0 as classification_id, id as monster_id from monsters where code in ('chatacabra', 'tetranadon', 'tetsucabra', 'berserk_tetsucabra', 'drilltusk_tetsucabra', 'zamtrios', 'tigerstripe_zamtrios')
    --bird_wyvern 26
    union all select 1 as classification_id, id as monster_id from monsters where code in ('aknosom', 'coral_pukei_pukei', 'gendrome', 'giadrome', 'great_baggi', 'great_izuchi', 'great_jaggi', 'great_maccao', 'great_wroggi', 'gypceros', 'purple_gypceros', 'hypnocatrice', 'iodrome', 'kulu_ya_ku', 'malfestio', 'nightcloak_malfestio', 'pukei_pukei', 'qurupeco', 'crimson_qurupeco', 'tzitzi_ya_ku', 'velocidrome', 'yian_garuga', 'scarred_yian_garuga', 'deadeye_yian_garuga', 'yian_kut_ku', 'blue_yian_kut_ku')
    --brute_wyvern 20
    union all select 2 as classification_id, id as monster_id from monsters where code in ('anjanath','fulgur_anjanath','banbaro','barroth','jade_barroth','brachydios','raging_brachydios','deviljho','savage_deviljho','duramboros','rust_duramboros','glavenus','acidic_glavenus','hellblade_glavenus','radobaan','rompopolo','quematrice','uragaan','steel_uragaan','crystalbeard_uragaan')
    --carapaceon 7
    union all select 3 as classification_id, id as monster_id from monsters where code in ('daimyo_hermitaur', 'plum_daimyo_hermitaur', 'stonefist_hermitaur', 'shen_gaoren', 'shogun_ceanataur', 'terra_shogun_ceanataur', 'rustrazor_ceanataur')
    --cephalopod 2
    union all select 4 as classification_id, id as monster_id from monsters where code in ('nu_udra', 'xu_wu')
    --construct 6
    union all select 5 as classification_id, id as monster_id from monsters where code in ('guardian_arkveld','guardian_doshaguma','guardian_ebony_odogaron','guardian_fulgur_anjanath','guardian_rathalos', 'zoh_shia')
    --demi_elder 2
    union all select 6 as classification_id, id as monster_id from monsters where code in ('gore_magala', 'chaotic_gore_magala')
    --elder_dragon 47
    union all select 7 as classification_id, id as monster_id from monsters where code in ('alatreon', 'amatsu', 'behemoth', 'ceadeus', 'goldbeard_ceadeus', 'chameleos', 'dah_ren_mohran', 'dalamadur', 'shah_dalamadur', 'dire_miralis', 'fatalis', 'crimson_fatalis', 'old_fatalis', 'gaismagorm', 'gogmazios', 'jhen_mohran', 'hallowed_jhen_mohran', 'kirin', 'oroshi_kirin', 'kulve_taroth', 'kushala_daora', 'rusted_kushala_daora', 'ashen_lao_shan_lung', 'lao_shan_lung', 'lunastra', 'malzeno', 'primordial_malzeno', 'nakarkos', 'namielle', 'nergigante', 'ruiner_nergigante', 'safi_jiiva', 'shagaru_magala', 'shara_ishvalda', 'teostra', 'thunder_serpent_narwa', 'narwa_the_allmother', 'vaal_hazak', 'blackveil_vaal_hazak', 'valstrax', 'crimson_glow_valstrax', 'velkhana', 'wind_serpent_ibushi', 'xeno_jiiva', 'yama_tsukami', 'zorah_magdaros')
    --fanged_beast 23
    union all select 8 as classification_id, id as monster_id from monsters where code in ('ajarakan', 'arzuros', 'apex_arzuros', 'redhelm_arzuros', 'bishaten', 'blood_orange_bishaten', 'blangonga', 'copper_blangonga', 'bulldrome', 'congalala', 'emerald_congalala', 'doshaguma', 'gammoth', 'elderfrost_gammoth', 'garangolm', 'goss_harag', 'kecha_wacha', 'ash_kecha_wacha', 'lagombi', 'snowbaron_lagombi', 'rajang', 'furious_rajang', 'volvidon')
    --fanged_wyvern 14
    union all select 9 as classification_id, id as monster_id from monsters where code in ('dodogama', 'great_girros', 'great_jagras', 'lunagaron', 'magnamalo', 'scorned_magnamalo', 'odogaron', 'ebony_odogaron', 'kadachi', 'kadachi', 'zinogre', 'apex_zinogre', 'stygian_zinogre', 'thunderlord_zinogre', 'tobi_kadachi', 'viper_tobi_kadachi')
    --flying_wyvern 50
    union all select 10 as classification_id, id as monster_id from monsters where code in ('akantor', 'arkveld', 'astalos', 'boltreaver_astalos', 'barioth', 'frostfang_barioth', 'sand_barioth', 'basarios', 'ruby_basarios', 'bazelgeuse', 'seething_bazelgeuse', 'diablos', 'apex_diablos', 'black_diablos', 'bloodbath_diablos', 'espinas', 'flaming_espinas', 'gigginox', 'baleful_gigginox', 'gravios', 'black_gravios', 'khezu', 'red_khezu', 'legiana', 'shrieking_legiana', 'monoblos', 'white_monoblos', 'nargacuga', 'green_nargacuga', 'lucent_nargacuga', 'silverwind_nargacuga', 'paolumu', 'nightshade_paolumu', 'rathalos', 'azure_rathalos', 'silver_rathalos', 'dreadking_rathalos', 'apex_rathalos', 'rathian', 'pink_rathian', 'gold_rathian', 'dreadqueen_rathian', 'apex_rathian', 'rey_dau', 'seregios', 'tigrex', 'brute_tigrex', 'molten_tigrex', 'grimclaw_tigrex', 'ukanlos')
    --leviathan 21
    union all select 11 as classification_id, id as monster_id from monsters where code in ('agnaktor', 'glacial_agnaktor', 'almudron', 'magma_almudron', 'balahara', 'gobul', 'hirabami', 'jin_dahaad', 'lagiacrus', 'abyssal_lagiacrus', 'ivory_lagiacrus', 'mizutsune', 'violet_mizutsune', 'soulseer_mizutsune', 'apex_mizutsune', 'nibelsnarf', 'royal_ludroth', 'purple_ludroth', 'somnacanth', 'aurora_somnacanth', 'uth_duna')
    --lynian 1
    union all select 12 as classification_id, id as monster_id from monsters where code in ('king_shakalaka')
    --neopteron 7
    union all select 13 as classification_id, id as monster_id from monsters where code in ('ahtal_ka', 'ahtal_neset', 'seltas', 'desert_seltas', 'seltas_queen', 'desert_seltas_queen', 'vespoid_queen')
    --piscine_wyvern 6
    union all select 14 as classification_id, id as monster_id from monsters where code in ('beotodus', 'cephadrome', 'jyuratodus', 'lavasioth', 'plesioth', 'green_plesioth')
    
    --snake_wyvern 2
    union all select 16 as classification_id, id as monster_id from monsters where code in ('najarala', 'tidal_najarala')
    --temnoceran 5
    union all select 17 as classification_id, id as monster_id from monsters where code in ('lala_barina', 'nerscylla', 'shrouded_nerscylla', 'rakna_kadaki', 'pyre_rakna_kadaki')
    --relict ignored as they are collabs (leshens)
    --unknown (re-classified as demi-elder; gore) 
;

---------------------------- habitats -----------------------------
create table if not exists monsters_biomes (
    monster_id integer not null references monsters(id),
    biome_id integer not null references biomes(id),
    primary key(monster_id, biome_id)
);

insert into monsters_biomes (biome_id, monster_id) 
    select 0 as biome_id, id as monster_id from monsters where code in ('ajarakan', 'balahara', 'chatacabra', 'gravios', 'gypceros', 'hirabami', 'nerscylla', 'nu_udra', 'rompopolo', 'xu_wu') -- Cave
    union all select 1 as biome_id, id as monster_id from monsters where code in ('arkveld', 'balahara', 'chatacabra', 'doshaguma', 'rathian', 'rey_dau', 'seregios') -- Desert
    union all select 2 as biome_id, id as monster_id from monsters where code in ('arkveld', 'congalala', 'lagiacrus', 'lala_barina', 'mizutsune', 'rathalos', 'rathian', 'uth_duna', 'yian_kut_ku') -- Forest
    union all select 4 as biome_id, id as monster_id from monsters where code in ('arkveld', 'blangonga', 'gore_magala', 'hirabami', 'jin_dahaad', 'nerscylla') -- Mountain
    union all select 5 as biome_id, id as monster_id from monsters where code in ('lagiacrus', 'mizutsune', 'uth_duna') -- Aquatic
    union all select 6 as biome_id, id as monster_id from monsters where code in ('arkveld', 'guardian_arkveld', 'guardian_doshaguma', 'gore_magala', 'guardian_ebony_odogaron', 'guardian_fulgur_anjanath', 'jin_dahaad', 'guardian_rathalos', 'xu_wu', 'zoh_shia') -- Ruin
    union all select 7 as biome_id, id as monster_id from monsters where code in ('arkveld', 'chatacabra', 'doshaguma', 'gypceros', 'quematrice', 'rathian', 'rey_dau', 'seregios') -- Savanna
    union all select 8 as biome_id, id as monster_id from monsters where code in ('arkveld', 'blangonga', 'gore_magala') -- Snowfield
    union all select 9 as biome_id, id as monster_id from monsters where code in ('gogmazios', 'jin_dahaad', 'zoh_shia') -- Special
    union all select 10 as biome_id, id as monster_id from monsters where code in ('guardian_arkveld', 'guardian_doshaguma', 'guardian_ebony_odogaron', 'guardian_fulgur_anjanath', 'guardian_rathalos', 'xu_wu', 'zoh_shia') -- Unique
    union all select 11 as biome_id, id as monster_id from monsters where code in ('gypceros') -- Swamp
    union all select 12 as biome_id, id as monster_id from monsters where code in ('ajarakan', 'arkveld', 'gogmazios', 'gravios', 'nu_udra', 'rathalos', 'rathian', 'rompopolo') -- Volcano
;
    
--------------------------- afflictions ----------------------------
create table if not exists monsters_afflictions (
    monster_id integer not null references monsters(id),
    affliction_id integer not null references afflictions(id),
    primary key(monster_id, affliction_id)
);

insert into monsters_afflictions (affliction_id, monster_id)
    select 0 as affliction_id, id as monster_id from monsters where code in ('ajarakan') -- BlastBlight
    union all select 1 as affliction_id, id as monster_id from monsters where code in ('guardian_ebony_odogaron', 'seregios') -- Bleeding
    union all select 2 as affliction_id, id as monster_id from monsters where code in ('mizutsune') -- BubbleBlight
    union all select 3 as affliction_id, id as monster_id from monsters where code in ('guardian_doshaguma') -- DefenseDown
    union all select 4 as affliction_id, id as monster_id from monsters where code in ('arkveld', 'guardian_arkveld', 'guardian_ebony_odogaron') -- Dragon
    union all select 6 as affliction_id, id as monster_id from monsters where code in ('ajarakan', 'congalala', 'gravios', 'mizutsune', 'nu_udra', 'quematrice', 'rathalos', 'guardian_rathalos', 'rathian', 'yian_kut_ku', 'zoh_shia') -- Fire
    union all select 7 as affliction_id, id as monster_id from monsters where code in ('gore_magala') -- FrenzyVirus
    union all select 8 as affliction_id, id as monster_id from monsters where code in ('blangonga', 'hirabami', 'jin_dahaad') -- FrostBlight
    union all select 10 as affliction_id, id as monster_id from monsters where code in ('blangonga', 'hirabami', 'jin_dahaad') -- Ice
    union all select 11 as affliction_id, id as monster_id from monsters where code in ('gypceros', 'lala_barina', 'congalala') -- Paralysis
    union all select 12 as affliction_id, id as monster_id from monsters where code in ('gravios', 'nerscylla', 'rathalos', 'rathian' ,'rompopolo', 'congalala') -- Poison
    union all select 13 as affliction_id, id as monster_id from monsters where code in ('gravios', 'nerscylla') -- Sleep
    union all select 15 as affliction_id, id as monster_id from monsters where code in ('congalala') -- Stench
    union all select 16 as affliction_id, id as monster_id from monsters where code in ('gypceros') -- Stun
    union all select 17 as affliction_id, id as monster_id from monsters where code in ('guardian_fulgur_anjanath', 'lagiacrus' ,'rey_dau', 'zoh_shia') -- Thunder
    union all select 18 as affliction_id, id as monster_id from monsters where code in ('balahara', 'mizutsune', 'uth_duna') -- Water
    union all select 19 as affliction_id, id as monster_id from monsters where code in ('nerscylla') -- Webbed
;
--------------------------- weaknesses ----------------------------
create table if not exists monsters_weaknesses (
    monster_id integer not null references monsters(id),
    weakness_id integer not null references weaknesses(id),
    primary key(monster_id, weakness_id)
);

insert into monsters_weaknesses (weakness_id, monster_id)
    select 0 as weakness_id, id as monster_id from monsters where code in ('blangonga', 'congalala', 'doshaguma', 'guardian_doshaguma', 'gore_magala', 'gypceros', 'hirabami', 'jin_dahaad', 'lagiacrus', 'lala_barina', 'nerscylla') -- Fire
    union all select 1 as weakness_id, id as monster_id from monsters where code in ('ajarakan', 'chatacabra', 'congalala', 'guardian_doshaguma', 'guardian_fulgur_anjanath', 'gypceros', 'lagiacrus', 'rey_dau', 'seregios', 'xu_wu', 'yian_kut_ku') -- Ice
    union all select 2 as weakness_id, id as monster_id from monsters where code in ('balahara', 'blangonga', 'chatacabra', 'doshaguma', 'guardian_doshaguma', 'gore_magala', 'hirabami', 'mizutsune', 'nerscylla', 'rathalos', 'guardian_rathalos', 'rathian', 'seregios', 'uth_duna', 'yian_kut_ku') -- Thunder
    union all select 3 as weakness_id, id as monster_id from monsters where code in ('ajarakan', 'gravios', 'guardian_ebony_odogaron', 'guardian_fulgur_anjanath', 'nu_udra', 'quematrice', 'rey_dau', 'rompopolo', 'yian_kut_ku') -- Water
    union all select 4 as weakness_id, id as monster_id from monsters where code in ('arkveld', 'guardian_arkveld', 'gore_magala', 'guardian_doshaguma', 'gravios', 'guardian_fulgur_anjanath', 'lagiacrus', 'mizutsune', 'rathalos', 'guardian_rathalos', 'rathian', 'zoh_shia') -- Dragon
    union all select 5 as weakness_id, id as monster_id from monsters where code in ('chatacabra', 'balahara', 'guardian_ebony_odogaron', 'nerscylla', 'quematrice') -- Paralysis
    union all select 6 as weakness_id, id as monster_id from monsters where code in ('hirabami') -- Sleep
    union all select 7 as weakness_id, id as monster_id from monsters where code in ('chatacabra', 'hirabami', 'quematrice', 'xu_wu') -- Poison
    union all select 9 as weakness_id, id as monster_id from monsters where code in ('chatacabra', 'lala_barina') -- Stun
;
--------------------------- games ----------------------------
create table if not exists monsters_gametitles (
                                                   monster_id integer not null references monsters(id),
                                                   game_title_id integer not null references game_titles(id),
                                                   primary key(monster_id, game_title_id)
);

insert into monsters_gametitles (game_title_id, monster_id)
    select 16 as game_title_id, id as monster_id from monsters where code in ('ajarakan', 'arkveld', 'guardian_arkveld', 'balahara', 'blangonga', 'chatacabra', 'congalala', 'doshaguma', 'guardian_doshaguma', 'gogmazios', 'gore_magala', 'gravios', 'guardian_ebony_odogaron', 'guardian_fulgur_anjanath', 'gypceros', 'hirabami', 'jin_dahaad', 'lagiacrus', 'lala_barina', 'mizutsune', 'nerscylla', 'nu_udra', 'omega_planetes', 'quematrice', 'rathalos', 'guardian_rathalos', 'rathian', 'rey_dau', 'rompopolo', 'seregios', 'uth_duna', 'xu_wu', 'yian_kut_ku', 'zoh_shia');
    
    
    
---------------------------- views -----------------------------
drop view if exists guessable_monsters_v;
create view guessable_monsters_v AS
select
    monsters.id monster_id,
    monsters.code monster_code,
    monsters.generation,
    threat_level,
    array_agg( distinct m_classifications.classification_id) classification_list,
    array_agg( distinct m_weaknesses.weakness_id) weakness_list,
    array_agg( distinct m_afflictions.affliction_id) affliction_list,
    array_agg( distinct m_biomes.biome_id) habitat_list,
    array_agg( distinct game_titles.code) games_list
from monsters
         inner join monsters_classifications m_classifications on monsters.id = m_classifications.monster_id

         left join monsters_weaknesses m_weaknesses on monsters.id = m_weaknesses.monster_id

         left join monsters_afflictions m_afflictions on monsters.id = m_afflictions.monster_id

         inner join monsters_biomes m_biomes on monsters.id = m_biomes.monster_id

         inner join monsters_gametitles on monsters.id = monsters_gametitles.monster_id
         inner join game_titles on monsters_gametitles.game_title_id = game_titles.id
group by monsters.id, monsters.code, monsters.generation, threat_level
;
