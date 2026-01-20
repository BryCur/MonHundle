-- Adds all data for monsters from Monster Hunter:Rise and Monster Hunter sunbreak 

---------------------------- habitats -----------------------------
insert into monsters_biomes (biome_id, monster_id)
select 0 as biome_id /* Cave */, id as monster_id from monsters where code in ('khezu', 'great_wroggi', 'magma_almudron', 'basarios') 
union all select 1 as biome_id /* Desert */, id as monster_id from monsters where code in ('kushala_daora', 'kulu_ya_ku', 'crimson_glow_valstrax', 'almudron', 'anjanath', 'barroth', 'basarios', 'bazelgeuse', 'seething_bazelgeuse', 'blood_orange_bishaten', 'daimyo_hermitaur', 'diablos') 
union all select 2 as biome_id /* Forest */, id as monster_id from monsters where code in ('magnamalo', 'lunagaron', 'kushala_daora', 'kulu_ya_ku', 'great_wroggi', 'great_izuchi', 'chaotic_gore_magala', 'crimson_glow_valstrax', 'aknosom', 'almudron', 'anjanath', 'arzuros', 'astalos', 'bazelgeuse', 'seething_bazelgeuse', 'bishaten', 'blood_orange_bishaten', 'chameleos', 'daimyo_hermitaur', 'espinas', 'flaming_espinas', 'garangolm') 
union all select 4 as biome_id /* Mountain */, id as monster_id from monsters where code in ('lunagaron', 'lagombi', 'kushala_daora', 'goss_harag', 'chaotic_gore_magala','barioth', 'crimson_glow_valstrax', 'bazelgeuse', 'seething_bazelgeuse') 
union all select 5 as biome_id /* Aquatic */, id as monster_id from monsters where code in ('jyuratodus', 'almudron', 'daimyo_hermitaur') 
union all select 6 as biome_id /* Ruin */, id as monster_id from monsters where code in ('chaotic_gore_magala') 
union all select 7 as biome_id /* Savanna */, id as monster_id from monsters where code in ('') 
union all select 8 as biome_id /* Snowfield */, id as monster_id from monsters where code in ('magnamalo', 'lunagaron', 'lagombi', 'great_izuchi', 'great_baggi', 'goss_harag', 'aknosom', 'barioth', 'crimson_glow_valstrax', 'bazelgeuse', 'seething_bazelgeuse') 
union all select 9 as biome_id /* Special */, id as monster_id from monsters where code in ('amatsu', 'gaismagorm') 
union all select 10 as biome_id /* Unique */, id as monster_id from monsters where code in ('') 
union all select 11 as biome_id /* Swamp */, id as monster_id from monsters where code in ('great_wroggi', 'crimson_glow_valstrax', 'bazelgeuse', 'seething_bazelgeuse', 'almudron', 'chameleos') 
union all select 12 as biome_id /* Volcano */, id as monster_id from monsters where code in ('magnamalo', 'kushala_daora', 'great_wroggi', 'magma_almudron', 'basarios', 'bazelgeuse', 'seething_bazelgeuse') 
;
    
--------------------------- afflictions ----------------------------

insert into monsters_afflictions (affliction_id, monster_id)
select 0 as affliction_id /* BlastBlight */, id as monster_id from monsters where code in ('garangolm', 'gaismagorm')
union all select 1 as affliction_id /* Bleeding */, id as monster_id from monsters where code in ('')
union all select 2 as affliction_id /* BubbleBlight */, id as monster_id from monsters where code in ('')
union all select 3 as affliction_id /* DefenseDown */, id as monster_id from monsters where code in ('flaming_espinas')
union all select 4 as affliction_id /* Dragon */, id as monster_id from monsters where code in ('kushala_daora', 'crimson_glow_valstrax')
union all select 6 as affliction_id /* FireBlight */, id as monster_id from monsters where code in ('garangolm', 'flaming_espinas', 'aknosom', 'magma_almudron', 'anjanath', 'basarios', 'bazelgeuse', 'seething_bazelgeuse', 'blood_orange_bishaten', 'espinas')
union all select 7 as affliction_id /* FrenzyVirus */, id as monster_id from monsters where code in ('chaotic_gore_magala')
union all select 8 as affliction_id /* FrostBlight / snowman */, id as monster_id from monsters where code in ('lagombi')
union all select 9 as affliction_id /* hellfireblight */, id as monster_id from monsters where code in ('magnamalo')
union all select 10 as affliction_id /* Ice */, id as monster_id from monsters where code in ('lunagaron', 'lagombi', 'barioth', 'goss_harag')
union all select 11 as affliction_id /* Paralysis */, id as monster_id from monsters where code in ('khezu', 'astalos', 'bishaten', 'espinas')
union all select 12 as affliction_id /* Poison */, id as monster_id from monsters where code in ('great_wroggi', 'flaming_espinas', 'basarios', 'bishaten', 'chameleos', 'espinas')
union all select 13 as affliction_id /* Sleep */, id as monster_id from monsters where code in ('basarios', 'great_baggi')
union all select 15 as affliction_id /* Stench */, id as monster_id from monsters where code in ('')
union all select 16 as affliction_id /* Stun */, id as monster_id from monsters where code in ('khezu', 'bishaten', 'goss_harag')
union all select 17 as affliction_id /* Thunder */, id as monster_id from monsters where code in ('khezu', 'amatsu', 'astalos')
union all select 18 as affliction_id /* Waterblight */, id as monster_id from monsters where code in ('jyuratodus', 'garangolm', 'almudron', 'amatsu', 'barroth', 'daimyo_hermitaur')
union all select 19 as affliction_id /* Webbed */, id as monster_id from monsters where code in ('')
union all select 20 as affliction_id /* Muddy */, id as monster_id from monsters where code in ('jyuratodus', 'barroth', 'almudron')

;
--------------------------- weaknesses ----------------------------

insert into monsters_weaknesses (weakness_id, monster_id)
select 0 as weakness_id /* Fire */, id as monster_id from monsters where code in ('lunagaron', 'lagombi', 'kulu_ya_ku', 'khezu', 'jyuratodus', 'great_baggi', 'goss_harag', 'chaotic_gore_magala', 'almudron', 'amatsu', 'arzuros', 'barioth', 'barroth', 'bishaten', 'chameleos', 'daimyo_hermitaur', 'crimson_glow_valstrax')
union all select 1 as weakness_id /* Ice */, id as monster_id from monsters where code in ('kulu_ya_ku', 'great_wroggi', 'espinas', 'almudron', 'magma_almudron', 'anjanath', 'arzuros', 'astalos', 'barroth', 'bazelgeuse', 'seething_bazelgeuse', 'bishaten', 'diablos', 'crimson_glow_valstrax')
union all select 2 as weakness_id /* Thunder */, id as monster_id from monsters where code in ('magnamalo', 'lunagaron', 'lagombi', 'kushala_daora', 'kulu_ya_ku', 'jyuratodus', 'great_izuchi', 'great_baggi', 'goss_harag', 'gaismagorm', 'garangolm', 'flaming_espinas', 'aknosom', 'barioth', 'bazelgeuse', 'seething_bazelgeuse', 'blood_orange_bishaten', 'daimyo_hermitaur', 'crimson_glow_valstrax')
union all select 3 as weakness_id /* Water */, id as monster_id from monsters where code in ('magnamalo', 'kulu_ya_ku', 'great_wroggi', 'great_izuchi', 'great_baggi', 'flaming_espinas', 'espinas', 'aknosom', 'magma_almudron', 'anjanath', 'basarios', 'blood_orange_bishaten', 'diablos', 'crimson_glow_valstrax')
union all select 4 as weakness_id /* Dragon */, id as monster_id from monsters where code in ('kushala_daora', 'kulu_ya_ku', 'chaotic_gore_magala', 'gaismagorm', 'espinas', 'amatsu', 'basarios', 'bazelgeuse', 'chameleos', 'diablos')
union all select 5 as weakness_id /* Paralysis */, id as monster_id from monsters where code in ('')
union all select 6 as weakness_id /* Sleep */, id as monster_id from monsters where code in ('')
union all select 7 as weakness_id /* Poison */, id as monster_id from monsters where code in ('kushala_daora')
union all select 9 as weakness_id /* Stun */, id as monster_id from monsters where code in ('')
;
--------------------------- games ----------------------------

insert into monsters_gametitles (game_title_id, monster_id)
select 16 as game_title_id, id as monster_id from monsters where code in ('aknosom', 'almudron', 'magma_almudron', 'amatsu', 'anjanath', 'arzuros', 'astalos', 'barioth', 'barroth', 'basarios', 'bazelgeuse', 'seething_bazelgeuse', 'bishaten', 'blood_orange_bishaten', 'chameleos', 'daimyo_hermitaur', 'diablos', 'crimson_glow_valstrax', 'espinas', 'flaming_espinas', 'garangolm', 'gaismagorm', 'gore_magala', 'chaotic_gore_magala', 'goss_harag', 'great_baggi', 'great_izuchi', 'great_wroggi', 'jyuratodus', 'khezu', 'kulu_ya_ku', 'kushala_daora', 'lagombi', 'lunagaron', 'magnamalo', 'scorned_magnamalo', 'malzeno', 'primordial_malzeno', 'mizutsune', 'violet_mizutsune', 'nargacuga', 'lucent_nargacuga', 'pukei_pukei', 'rajang', 'furious_rajang', 'rakna_kadaki', 'pyre_rakna_kadaki', 'rathalos', 'silver_rathalos', 'rathian', 'gold_rathian', 'royal_ludroth', 'seregios', 'shagaru_magala', 'shogun_ceanataur', 'somnacanth', 'aurora_somnacanth', 'teostra', 'tetranadon', 'thunder_serpent_narwa', 'narwa_the_allmother', 'tigrex', 'tobi_kadachi', 'velkhana', 'volvidon', 'wind_serpent_ibushi', 'zinogre') -- sunbreak
union all select 15 as game_title_id, id as monster_id from monsters where code in ('aknosom', 'almudron', 'anjanath', 'arzuros', 'barioth', 'barroth', 'basarios', 'bazelgeuse', 'bishaten', 'chameleos', 'crimson_glow_valstrax', 'diablos', 'goss_harag', 'great_baggi', 'great_izuchi', 'great_wroggi', 'jyuratodus', 'khezu', 'kulu_ya_ku', 'kushala_daora', 'lagombi', 'magnamalo', 'mizutsune', 'nargacuga', 'pukei_pukei', 'rajang', 'rakna_kadaki', 'rathalos', 'rathian', 'royal_ludroth', 'somnacanth', 'teostra', 'tetranadon', 'thunder_serpent_narwa', 'narwa_the_allmother', 'tigrex', 'tobi_kadachi', 'volvidon', 'wind_serpent_ibushi', 'zinogre') -- rise
;


