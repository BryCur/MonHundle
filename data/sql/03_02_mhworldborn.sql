-- Adds all data for monsters from Monster Hunter:Rise and Monster Hunter sunbreak 

/*
Monster whose data are already written due to "future" games
- Anjanath
- Barioth
- Barroth
- Bazelgeuse
- Seething Bazelgeuse
- diablos
- Jyuratodus 
- Kulu ya ku
- Kushala Daora
- nargacuga
- rajang
- rathalos
- silver rathalos
- rathian 
- teostra 
- tigrex
- velkhana
- zinogre
*/

---------------------------- habitats -----------------------------
insert into monsters_biomes (biome_id, monster_id)
select 0 as biome_id /* Cave */, id as monster_id from monsters where code in ('xeno_jiiva', 'blackveil_vaal_hazak', 'vaal_hazak', 'uragaan', 'viper_tobi_kadachi', 'safi_jiiva', 'ebony_odogaron', 'odogaron', 'ruiner_nergigante', 'nergigante', 'kulve_taroth', 'great_girros', 'acidic_glavenus', 'dodogama', 'black_diablos', 'brachydios', 'fulgur_anjanath')
union all select 1 as biome_id /* Desert */, id as monster_id from monsters where code in ('brute_tigrex', 'pink_rathian', 'nightshade_paolumu', 'ebony_odogaron', 'ruiner_nergigante', 'nergigante', 'lunastra', 'glavenus', 'black_diablos', 'deviljho', 'savage_deviljho', 'banbaro', 'fulgur_anjanath')
union all select 2 as biome_id /* Forest */, id as monster_id from monsters where code in ('scarred_yian_garuga', 'yian_garuga', 'blackveil_vaal_hazak', 'pink_rathian', 'azure_rathalos', 'nightshade_paolumu', 'ebony_odogaron', 'ruiner_nergigante', 'nergigante', 'great_jagras', 'glavenus', 'deviljho', 'savage_deviljho', 'raging_brachydios', 'banbaro', 'fulgur_anjanath')
union all select 3 as biome_id /* highland */, id as monster_id from monsters where code in ('tzitzi_ya_ku', 'pink_rathian', 'coral_pukei_pukei', 'paolumu', 'ebony_odogaron', 'namielle', 'shrieking_legiana', 'legiana', 'kirin', 'deviljho', 'savage_deviljho')
union all select 4 as biome_id /* Mountain */, id as monster_id from monsters where code in ('stygian_zinogre', 'shara_ishvalda', 'safi_jiiva', 'coral_pukei_pukei', 'paolumu', 'ruiner_nergigante', 'nergigante', 'shrieking_legiana', 'legiana', 'frostfang_barioth')
union all select 5 as biome_id /* Aquatic */, id as monster_id from monsters where code in ('namielle')
union all select 6 as biome_id /* Ruin */, id as monster_id from monsters where code in ('fatalis')
union all select 8 as biome_id /* Snowfield */, id as monster_id from monsters where code in ('stygian_zinogre', 'viper_tobi_kadachi', 'ruiner_nergigante', 'deviljho', 'savage_deviljho', 'beotodus', 'frostfang_barioth', 'banbaro', 'fulgur_anjanath')
union all select 9 as biome_id /* Special */, id as monster_id from monsters where code in ('zorah_magdaros', 'shara_ishvalda', 'safi_jiiva', 'kulve_taroth', 'fatalis', 'alatreon')
union all select 10 as biome_id /* Unique */, id as monster_id from monsters where code in ('xeno_jiiva', 'vaal_hazak', 'radobaan', 'odogaron', 'great_girros', 'acidic_glavenus', 'raging_brachydios')
union all select 12 as biome_id /* Volcano */, id as monster_id from monsters where code in ('stygian_zinogre', 'uragaan', 'brute_tigrex', 'azure_rathalos', 'lunastra', 'lavasioth', 'kulve_taroth', 'glavenus', 'dodogama', 'deviljho', 'savage_deviljho', 'raging_brachydios', 'brachydios', 'banbaro', 'fulgur_anjanath')
;
    
--------------------------- afflictions ----------------------------
insert into afflictions (id, code) VALUES (21, 'effluvium');

insert into monsters_afflictions (affliction_id, monster_id)
select 0 as affliction_id /* BlastBlight */, id as monster_id from monsters where code in ('dodogama', 'brachydios')
union all select 1 as affliction_id /* Bleeding */, id as monster_id from monsters where code in ('ebony_odogaron', 'odogaron', 'ruiner_nergigante')
union all select 3 as affliction_id /* DefenseDown */, id as monster_id from monsters where code in ('acidic_glavenus', 'deviljho', 'savage_deviljho')
union all select 4 as affliction_id /* Dragon */, id as monster_id from monsters where code in ('stygian_zinogre', 'xeno_jiiva', 'ebony_odogaron', 'deviljho', 'savage_deviljho', 'alatreon')
union all select 6 as affliction_id /* FireBlight */, id as monster_id from monsters where code in ('zorah_magdaros', 'scarred_yian_garuga', 'yian_garuga', 'xeno_jiiva', 'uragaan', 'safi_jiiva', 'pink_rathian', 'azure_rathalos', 'lunastra', 'lavasioth', 'kulve_taroth', 'glavenus', 'fatalis', 'dodogama', 'alatreon')
union all select 8 as affliction_id /* FrostBlight / snowman */, id as monster_id from monsters where code in ('frostfang_barioth')
union all select 10 as affliction_id /* Ice */, id as monster_id from monsters where code in ('shrieking_legiana', 'legiana', 'beotodus', 'frostfang_barioth', 'alatreon')
union all select 11 as affliction_id /* Paralysis */, id as monster_id from monsters where code in ('viper_tobi_kadachi', 'kirin', 'great_girros')
union all select 12 as affliction_id /* Poison */, id as monster_id from monsters where code in ('scarred_yian_garuga', 'yian_garuga', 'viper_tobi_kadachi', 'pink_rathian', 'azure_rathalos')
union all select 13 as affliction_id /* Sleep */, id as monster_id from monsters where code in ('uragaan', 'radobaan', 'nightshade_paolumu')
union all select 16 as affliction_id /* Stun */, id as monster_id from monsters where code in ('tzitzi_ya_ku', 'shara_ishvalda', 'black_diablos')
union all select 17 as affliction_id /* Thunder */, id as monster_id from monsters where code in ('namielle', 'kirin', 'fulgur_anjanath', 'alatreon')
union all select 18 as affliction_id /* Waterblight */, id as monster_id from monsters where code in ('coral_pukei_pukei', 'namielle', 'alatreon')
union all select 21 as affliction_id /* Effluvium */, id as monster_id from monsters where code in ('blackveil_vaal_hazak', 'vaal_hazak')

;
--------------------------- weaknesses ----------------------------

insert into monsters_weaknesses (weakness_id, monster_id)
select 0 as weakness_id /* Fire */, id as monster_id from monsters where code in ('xeno_jiiva', 'blackveil_vaal_hazak', 'vaal_hazak', 'safi_jiiva', 'nightshade_paolumu', 'paolumu', 'namielle', 'shrieking_legiana', 'legiana', 'kirin', 'great_jagras', 'acidic_glavenus', 'beotodus', 'frostfang_barioth', 'alatreon')
union all select 1 as weakness_id /* Ice */, id as monster_id from monsters where code in ('stygian_zinogre', 'blackveil_vaal_hazak', 'tzitzi_ya_ku', 'viper_tobi_kadachi', 'shara_ishvalda', 'safi_jiiva', 'azure_rathalos', 'coral_pukei_pukei', 'odogaron', 'lunastra', 'kulve_taroth', 'kirin', 'great_girros', 'black_diablos', 'raging_brachydios', 'brachydios', 'fulgur_anjanath', 'alatreon')
union all select 2 as weakness_id /* Thunder */, id as monster_id from monsters where code in ('vaal_hazak', 'tzitzi_ya_ku', 'viper_tobi_kadachi', 'brute_tigrex', 'safi_jiiva', 'pink_rathian', 'radobaan', 'coral_pukei_pukei', 'paolumu', 'odogaron', 'ruiner_nergigante', 'nergigante', 'shrieking_legiana', 'legiana', 'great_jagras', 'deviljho', 'savage_deviljho', 'beotodus', 'frostfang_barioth')
union all select 3 as weakness_id /* Water */, id as monster_id from monsters where code in ('zorah_magdaros', 'stygian_zinogre', 'scarred_yian_garuga', 'yian_garuga', 'uragaan', 'brute_tigrex', 'shara_ishvalda', 'safi_jiiva', 'nightshade_paolumu', 'ebony_odogaron', 'lavasioth', 'kirin', 'great_girros', 'glavenus', 'black_diablos', 'deviljho', 'savage_deviljho', 'raging_brachydios', 'brachydios', 'fulgur_anjanath')
union all select 4 as weakness_id /* Dragon */, id as monster_id from monsters where code in ('zorah_magdaros', 'scarred_yian_garuga', 'yian_garuga', 'xeno_jiiva', 'uragaan', 'safi_jiiva', 'pink_rathian', 'azure_rathalos', 'radobaan', 'ruiner_nergigante', 'namielle', 'lunastra', 'kulve_taroth', 'fatalis', 'deviljho', 'savage_deviljho', 'frostfang_barioth', 'banbaro', 'alatreon')
union all select 5 as weakness_id /* Paralysis */, id as monster_id from monsters where code in ('odogaron')
union all select 7 as weakness_id /* Poison */, id as monster_id from monsters where code in ('legiana')
union all select 8 as weakness_id /* Blast */, id as monster_id from monsters where code in ('radobaan')
;
--------------------------- games ----------------------------

insert into monsters_gametitles (game_title_id, monster_id)
select 13 as game_title_id /* Iceborn */, id as monster_id from monsters where code in ('alatreon', 'anjanath', 'fulgur_anjanath', 'banbaro', 'barioth', 'frostfang_barioth', 'barroth', 'bazelgeuse', 'seething_bazelgeuse', 'beotodus', 'brachydios', 'raging_brachydios', 'deviljho', 'savage_deviljho', 'diablos', 'black_diablos', 'dodogama', 'fatalis', 'glavenus', 'acidic_glavenus', 'great_girros', 'great_jagras', 'jyuratodus', 'kirin', 'kulu_ya_ku', 'kulve_taroth', 'kushala_daora', 'lavasioth', 'legiana', 'shrieking_legiana', 'lunastra', 'namielle', 'nargacuga', 'nergigante', 'ruiner_nergigante', 'odogaron', 'ebony_odogaron', 'paolumu', 'nightshade_paolumu', 'pukei_pukei', 'coral_pukei_pukei', 'radobaan', 'rajang', 'furious_rajang', 'rathalos', 'azure_rathalos', 'silver_rathalos', 'rathian', 'pink_rathian', 'gold_rathian', 'safi_jiiva', 'shara_ishvalda', 'teostra', 'tigrex', 'brute_tigrex', 'tobi_kadachi', 'viper_tobi_kadachi', 'tzitzi_ya_ku', 'uragaan', 'vaal_hazak', 'blackveil_vaal_hazak', 'velkhana', 'xeno_jiiva', 'yian_garuga', 'scarred_yian_garuga', 'zinogre', 'stygian_zinogre', 'zorah_magdaros')
union all select 12 as game_title_id /* World */, id as monster_id from monsters where code in ('anjanath','barroth','bazelgeuse','deviljho','diablos','black_diablos','dodogama','great_girros','great_jagras','jyuratodus','kirin','kulu_ya_ku','kulve_taroth','kushala_daora','lavasioth','legiana','lunastra','nergigante','odogaron','paolumu', 'pukei_pukei', 'radobaan','rathalos','azure_rathalos','rathian','pink_rathian','teostra','tobi_kadachi','tzitzi_ya_ku','uragaan','vaal_hazak','xeno_jiiva','zorah_magdaros')
;