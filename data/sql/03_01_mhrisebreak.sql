-- Adds all data for monsters from Monster Hunter:Rise and Monster Hunter sunbreak 

-- note for seregios: completing locales where it appears
    
---------------------------- habitats -----------------------------
insert into monsters_biomes (biome_id, monster_id)
select 0 as biome_id /* Cave */, id as monster_id from monsters where code in ('tetranadon', 'aurora_somnacanth', 'somnacanth', 'shogun_ceanataur', 'royal_ludroth', 'rakna_kadaki', 'khezu', 'great_wroggi', 'magma_almudron', 'basarios') 
union all select 1 as biome_id /* Desert */, id as monster_id from monsters where code in ('volvidon', 'velkhana', 'tigrex', 'teostra', 'rakna_kadaki', 'furious_rajang', 'rajang', 'pukei_pukei', 'kushala_daora', 'kulu_ya_ku', 'crimson_glow_valstrax', 'almudron', 'anjanath', 'barroth', 'basarios', 'bazelgeuse', 'seething_bazelgeuse', 'blood_orange_bishaten', 'daimyo_hermitaur', 'diablos') 
union all select 2 as biome_id /* Forest */, id as monster_id from monsters where code in ('zinogre', 'volvidon', 'velkhana', 'tobi_kadachi', 'tigrex', 'tetranadon', 'seregios', 'royal_ludroth', 'gold_rathian', 'furious_rajang', 'rajang', 'pukei_pukei', 'nargacuga', 'primordial_malzeno', 'malzeno', 'scorned_magnamalo', 'magnamalo', 'lunagaron', 'kushala_daora', 'kulu_ya_ku', 'great_wroggi', 'great_izuchi', 'chaotic_gore_magala', 'crimson_glow_valstrax', 'aknosom', 'almudron', 'anjanath', 'arzuros', 'astalos', 'bazelgeuse', 'seething_bazelgeuse', 'bishaten', 'blood_orange_bishaten', 'chameleos', 'daimyo_hermitaur', 'espinas', 'flaming_espinas', 'garangolm') 
union all select 4 as biome_id /* Mountain */, id as monster_id from monsters where code in ('zinogre', 'velkhana', 'tigrex', 'aurora_somnacanth', 'shagaru_magala', 'furious_rajang', 'rajang', 'lunagaron', 'lagombi', 'kushala_daora', 'goss_harag', 'chaotic_gore_magala','barioth', 'crimson_glow_valstrax', 'bazelgeuse', 'seething_bazelgeuse') 
union all select 5 as biome_id /* Aquatic */, id as monster_id from monsters where code in ('tetranadon', 'aurora_somnacanth', 'somnacanth', 'jyuratodus', 'almudron', 'daimyo_hermitaur') 
union all select 6 as biome_id /* Ruin */, id as monster_id from monsters where code in ('wind_serpent_ibushi', 'narwa_the_allmother', 'thunder_serpent_narwa', 'teostra', 'shagaru_magala', 'royal_ludroth', 'gold_rathian', 'silver_rathalos', 'pyre_rakna_kadaki', 'lucent_nargacuga', 'violet_mizutsune', 'primordial_malzeno', 'malzeno', 'chaotic_gore_magala') 
union all select 8 as biome_id /* Snowfield */, id as monster_id from monsters where code in ('velkhana', 'tigrex', 'tetranadon', 'somnacanth', 'seregios', 'furious_rajang', 'rajang', 'magnamalo', 'lunagaron', 'lagombi', 'great_izuchi', 'great_baggi', 'goss_harag', 'aknosom', 'barioth', 'crimson_glow_valstrax', 'bazelgeuse', 'seething_bazelgeuse') 
union all select 9 as biome_id /* Special */, id as monster_id from monsters where code in ('wind_serpent_ibushi', 'narwa_the_allmother', 'thunder_serpent_narwa', 'lucent_nargacuga', 'violet_mizutsune', 'amatsu', 'gaismagorm') 
union all select 11 as biome_id /* Swamp */, id as monster_id from monsters where code in ('shogun_ceanataur', 'scorned_magnamalo', 'great_wroggi', 'crimson_glow_valstrax', 'bazelgeuse', 'seething_bazelgeuse', 'almudron', 'chameleos') 
union all select 12 as biome_id /* Volcano */, id as monster_id from monsters where code in ('volvidon', 'velkhana', 'tigrex', 'teostra', 'shogun_ceanataur', 'seregios', 'gold_rathian', 'silver_rathalos', 'pyre_rakna_kadaki', 'rakna_kadaki', 'furious_rajang', 'rajang', 'scorned_magnamalo', 'magnamalo', 'kushala_daora', 'great_wroggi', 'magma_almudron', 'basarios', 'bazelgeuse', 'seething_bazelgeuse') 
;
    
--------------------------- afflictions ----------------------------

insert into monsters_afflictions (affliction_id, monster_id)
select 0 as affliction_id /* BlastBlight */, id as monster_id from monsters where code in ('teostra', 'somnacanth', 'garangolm', 'gaismagorm')
union all select 1 as affliction_id /* Bleeding */, id as monster_id from monsters where code in ('shogun_ceanataur')
union all select 3 as affliction_id /* DefenseDown */, id as monster_id from monsters where code in ('flaming_espinas')
union all select 4 as affliction_id /* Dragon */, id as monster_id from monsters where code in ('wind_serpent_ibushi', 'primordial_malzeno', 'malzeno', 'scorned_magnamalo', 'kushala_daora', 'crimson_glow_valstrax')
union all select 6 as affliction_id /* FireBlight */, id as monster_id from monsters where code in ('teostra', 'gold_rathian', 'silver_rathalos', 'rakna_kadaki', 'violet_mizutsune', 'garangolm', 'flaming_espinas', 'aknosom', 'magma_almudron', 'anjanath', 'basarios', 'bazelgeuse', 'seething_bazelgeuse', 'blood_orange_bishaten', 'espinas')
union all select 7 as affliction_id /* FrenzyVirus */, id as monster_id from monsters where code in ('shagaru_magala', 'chaotic_gore_magala')
union all select 8 as affliction_id /* FrostBlight / snowman */, id as monster_id from monsters where code in ('velkhana', 'lagombi')
union all select 9 as affliction_id /* hellfireblight */, id as monster_id from monsters where code in ('scorned_magnamalo', 'magnamalo')
union all select 10 as affliction_id /* Ice */, id as monster_id from monsters where code in ('velkhana', 'aurora_somnacanth', 'lunagaron', 'lagombi', 'barioth', 'goss_harag')
union all select 11 as affliction_id /* Paralysis */, id as monster_id from monsters where code in ('volvidon', 'khezu', 'astalos', 'bishaten', 'espinas')
union all select 12 as affliction_id /* Poison */, id as monster_id from monsters where code in ('gold_rathian', 'silver_rathalos', 'pukei_pukei', 'lucent_nargacuga', 'great_wroggi', 'flaming_espinas', 'basarios', 'bishaten', 'chameleos', 'espinas')
union all select 13 as affliction_id /* Sleep */, id as monster_id from monsters where code in ('somnacanth', 'basarios', 'great_baggi')
union all select 15 as affliction_id /* Stench */, id as monster_id from monsters where code in ('volvidon')
union all select 16 as affliction_id /* Stun */, id as monster_id from monsters where code in ('narwa_the_allmother', 'thunder_serpent_narwa', 'tetranadon', 'somnacanth', 'lucent_nargacuga', 'khezu', 'bishaten', 'goss_harag')
union all select 17 as affliction_id /* Thunder */, id as monster_id from monsters where code in ('zinogre', 'tobi_kadachi', 'narwa_the_allmother', 'thunder_serpent_narwa', 'furious_rajang', 'rajang', 'khezu', 'amatsu', 'astalos')
union all select 18 as affliction_id /* Waterblight */, id as monster_id from monsters where code in ('tetranadon', 'shogun_ceanataur', 'royal_ludroth', 'jyuratodus', 'garangolm', 'almudron', 'amatsu', 'barroth', 'daimyo_hermitaur')
union all select 19 as affliction_id /* Webbed */, id as monster_id from monsters where code in ('pyre_rakna_kadaki', 'rakna_kadaki')
union all select 20 as affliction_id /* Muddy */, id as monster_id from monsters where code in ('jyuratodus', 'barroth', 'almudron')
;
--------------------------- weaknesses ----------------------------

insert into monsters_weaknesses (weakness_id, monster_id)
select 0 as weakness_id /* Fire */, id as monster_id from monsters where code in ('wind_serpent_ibushi', 'velkhana', 'tetranadon', 'aurora_somnacanth', 'somnacanth', 'shogun_ceanataur', 'shagaru_magala', 'royal_ludroth', 'nargacuga', 'primordial_malzeno', 'malzeno', 'lunagaron', 'lagombi', 'kulu_ya_ku', 'khezu', 'jyuratodus', 'great_baggi', 'goss_harag', 'chaotic_gore_magala', 'almudron', 'amatsu', 'arzuros', 'barioth', 'barroth', 'bishaten', 'chameleos', 'daimyo_hermitaur', 'crimson_glow_valstrax')
union all select 1 as weakness_id /* Ice */, id as monster_id from monsters where code in ('zinogre', 'volvidon', 'teostra', 'pyre_rakna_kadaki', 'rakna_kadaki', 'furious_rajang', 'rajang', 'pukei_pukei', 'lucent_nargacuga', 'violet_mizutsune', 'kulu_ya_ku', 'great_wroggi', 'espinas', 'almudron', 'magma_almudron', 'anjanath', 'arzuros', 'astalos', 'barroth', 'bazelgeuse', 'seething_bazelgeuse', 'bishaten', 'diablos', 'crimson_glow_valstrax')
union all select 2 as weakness_id /* Thunder */, id as monster_id from monsters where code in ('volvidon', 'tigrex', 'tetranadon', 'aurora_somnacanth', 'somnacanth', 'shogun_ceanataur', 'royal_ludroth', 'gold_rathian', 'silver_rathalos', 'pukei_pukei', 'nargacuga', 'violet_mizutsune', 'scorned_magnamalo', 'magnamalo', 'lunagaron', 'lagombi', 'kushala_daora', 'kulu_ya_ku', 'jyuratodus', 'great_izuchi', 'great_baggi', 'goss_harag', 'gaismagorm', 'garangolm', 'flaming_espinas', 'aknosom', 'barioth', 'bazelgeuse', 'seething_bazelgeuse', 'blood_orange_bishaten', 'daimyo_hermitaur', 'crimson_glow_valstrax')
union all select 3 as weakness_id /* Water */, id as monster_id from monsters where code in ('volvidon', 'tobi_kadachi', 'teostra', 'gold_rathian', 'silver_rathalos', 'pyre_rakna_kadaki', 'rakna_kadaki', 'scorned_magnamalo', 'magnamalo', 'kulu_ya_ku', 'great_wroggi', 'great_izuchi', 'great_baggi', 'flaming_espinas', 'espinas', 'aknosom', 'magma_almudron', 'anjanath', 'basarios', 'blood_orange_bishaten', 'diablos', 'crimson_glow_valstrax')
union all select 4 as weakness_id /* Dragon */, id as monster_id from monsters where code in ('wind_serpent_ibushi', 'velkhana', 'tigrex', 'narwa_the_allmother', 'thunder_serpent_narwa', 'shagaru_magala', 'lucent_nargacuga', 'primordial_malzeno', 'malzeno', 'kushala_daora', 'kulu_ya_ku', 'chaotic_gore_magala', 'gaismagorm', 'espinas', 'amatsu', 'basarios', 'bazelgeuse', 'chameleos', 'diablos')
union all select 7 as weakness_id /* Poison */, id as monster_id from monsters where code in ('kushala_daora')
;
--------------------------- games ----------------------------

insert into monsters_gametitles (game_title_id, monster_id)
select 16 as game_title_id, id as monster_id from monsters where code in ('aknosom', 'almudron', 'magma_almudron', 'amatsu', 'anjanath', 'arzuros', 'astalos', 'barioth', 'barroth', 'basarios', 'bazelgeuse', 'seething_bazelgeuse', 'bishaten', 'blood_orange_bishaten', 'chameleos', 'daimyo_hermitaur', 'diablos', 'crimson_glow_valstrax', 'espinas', 'flaming_espinas', 'garangolm', 'gaismagorm', 'gore_magala', 'chaotic_gore_magala', 'goss_harag', 'great_baggi', 'great_izuchi', 'great_wroggi', 'jyuratodus', 'khezu', 'kulu_ya_ku', 'kushala_daora', 'lagombi', 'lunagaron', 'magnamalo', 'scorned_magnamalo', 'malzeno', 'primordial_malzeno', 'mizutsune', 'violet_mizutsune', 'nargacuga', 'lucent_nargacuga', 'pukei_pukei', 'rajang', 'furious_rajang', 'rakna_kadaki', 'pyre_rakna_kadaki', 'rathalos', 'silver_rathalos', 'rathian', 'gold_rathian', 'royal_ludroth', 'seregios', 'shagaru_magala', 'shogun_ceanataur', 'somnacanth', 'aurora_somnacanth', 'teostra', 'tetranadon', 'thunder_serpent_narwa', 'narwa_the_allmother', 'tigrex', 'tobi_kadachi', 'velkhana', 'volvidon', 'wind_serpent_ibushi', 'zinogre') -- sunbreak
union all select 15 as game_title_id, id as monster_id from monsters where code in ('aknosom', 'almudron', 'anjanath', 'arzuros', 'barioth', 'barroth', 'basarios', 'bazelgeuse', 'bishaten', 'chameleos', 'crimson_glow_valstrax', 'diablos', 'goss_harag', 'great_baggi', 'great_izuchi', 'great_wroggi', 'jyuratodus', 'khezu', 'kulu_ya_ku', 'kushala_daora', 'lagombi', 'magnamalo', 'mizutsune', 'nargacuga', 'pukei_pukei', 'rajang', 'rakna_kadaki', 'rathalos', 'rathian', 'royal_ludroth', 'somnacanth', 'teostra', 'tetranadon', 'thunder_serpent_narwa', 'narwa_the_allmother', 'tigrex', 'tobi_kadachi', 'volvidon', 'wind_serpent_ibushi', 'zinogre') -- rise
;


