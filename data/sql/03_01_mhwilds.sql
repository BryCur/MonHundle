-- Adds all data for monsters from Monster Hunter: Wilds

---------------------------- habitats -----------------------------
insert into monsters_biomes (biome_id, monster_id) 
    select 0 as biome_id /* Cave */, id as monster_id from monsters where code in ('ajarakan', 'balahara', 'chatacabra', 'gravios', 'gypceros', 'hirabami', 'nerscylla', 'nu_udra', 'rompopolo', 'xu_wu') -- Cave
    union all select 1 as biome_id /* Desert */, id as monster_id from monsters where code in ('arkveld', 'balahara', 'chatacabra', 'doshaguma', 'rathian', 'rey_dau', 'seregios') -- Desert
    union all select 2 as biome_id /* Forest */, id as monster_id from monsters where code in ('arkveld', 'congalala', 'lagiacrus', 'lala_barina', 'mizutsune', 'rathalos', 'rathian', 'uth_duna', 'yian_kut_ku') -- Forest
    union all select 4 as biome_id /* Mountain */, id as monster_id from monsters where code in ('arkveld', 'blangonga', 'gore_magala', 'hirabami', 'jin_dahaad', 'nerscylla') -- Mountain
    union all select 5 as biome_id /* Aquatic */, id as monster_id from monsters where code in ('lagiacrus', 'mizutsune', 'uth_duna') -- Aquatic
    union all select 6 as biome_id /* Ruin */, id as monster_id from monsters where code in ('arkveld', 'guardian_arkveld', 'guardian_doshaguma', 'gore_magala', 'guardian_ebony_odogaron', 'guardian_fulgur_anjanath', 'jin_dahaad', 'guardian_rathalos', 'xu_wu', 'zoh_shia') -- Ruin
    union all select 7 as biome_id /* Savanna */, id as monster_id from monsters where code in ('arkveld', 'chatacabra', 'doshaguma', 'gypceros', 'quematrice', 'rathian', 'rey_dau', 'seregios')
    union all select 8 as biome_id /* Snowfield */, id as monster_id from monsters where code in ('arkveld', 'blangonga', 'gore_magala')
    union all select 9 as biome_id /* Special */, id as monster_id from monsters where code in ('gogmazios', 'jin_dahaad', 'zoh_shia')
    union all select 10 as biome_id /* Unique */, id as monster_id from monsters where code in ('guardian_arkveld', 'guardian_doshaguma', 'guardian_ebony_odogaron', 'guardian_fulgur_anjanath', 'guardian_rathalos', 'xu_wu', 'zoh_shia')
    union all select 11 as biome_id /* Swamp */, id as monster_id from monsters where code in ('gypceros')
    union all select 12 as biome_id /* Volcano */, id as monster_id from monsters where code in ('ajarakan', 'arkveld', 'gogmazios', 'gravios', 'nu_udra', 'rathalos', 'rathian', 'rompopolo')
on conflict do nothing;

--------------------------- afflictions ----------------------------
insert into monsters_afflictions (affliction_id, monster_id)
    select 0 as affliction_id /* BlastBlight */, id as monster_id from monsters where code in ('ajarakan') -- BlastBlight
    union all select 1 as affliction_id /* Bleeding */, id as monster_id from monsters where code in ('guardian_ebony_odogaron', 'seregios')
    union all select 2 as affliction_id /* BubbleBlight */, id as monster_id from monsters where code in ('mizutsune')
    union all select 3 as affliction_id /* DefenseDown */, id as monster_id from monsters where code in ('guardian_doshaguma')
    union all select 4 as affliction_id /* Dragon */, id as monster_id from monsters where code in ('arkveld', 'guardian_arkveld', 'guardian_ebony_odogaron')
    union all select 6 as affliction_id /* Fire */, id as monster_id from monsters where code in ('ajarakan', 'congalala', 'gravios', 'mizutsune', 'nu_udra', 'quematrice', 'rathalos', 'guardian_rathalos', 'rathian', 'yian_kut_ku', 'zoh_shia', 'gogmazios')
    union all select 7 as affliction_id /* FrenzyVirus */, id as monster_id from monsters where code in ('gore_magala')
    union all select 8 as affliction_id /* FrostBlight */, id as monster_id from monsters where code in ('blangonga', 'hirabami', 'jin_dahaad')
    union all select 10 as affliction_id /* Ice */, id as monster_id from monsters where code in ('blangonga', 'hirabami', 'jin_dahaad')
    union all select 11 as affliction_id /* Paralysis */, id as monster_id from monsters where code in ('gypceros', 'lala_barina', 'congalala')
    union all select 12 as affliction_id /* Poison */, id as monster_id from monsters where code in ('gravios', 'nerscylla', 'rathalos', 'rathian' ,'rompopolo', 'congalala')
    union all select 13 as affliction_id /* Sleep */, id as monster_id from monsters where code in ('gravios', 'nerscylla')
    union all select 15 as affliction_id /* Stench */, id as monster_id from monsters where code in ('congalala')
    union all select 16 as affliction_id /* Stun */, id as monster_id from monsters where code in ('gypceros')
    union all select 17 as affliction_id /* Thunder */, id as monster_id from monsters where code in ('guardian_fulgur_anjanath', 'lagiacrus' ,'rey_dau', 'zoh_shia')
    union all select 18 as affliction_id /* Water */, id as monster_id from monsters where code in ('balahara', 'mizutsune', 'uth_duna')
    union all select 19 as affliction_id /* Webbed */, id as monster_id from monsters where code in ('nerscylla')
on conflict do nothing;

--------------------------- weaknesses ----------------------------
insert into monsters_weaknesses (weakness_id, monster_id)
    select 0 as weakness_id /* Fire */, id as monster_id from monsters where code in ('blangonga', 'congalala', 'doshaguma', 'guardian_doshaguma', 'gore_magala', 'gypceros', 'hirabami', 'jin_dahaad', 'lagiacrus', 'lala_barina', 'nerscylla', 'gogmazios')
    union all select 1 as weakness_id /* Ice */, id as monster_id from monsters where code in ('ajarakan', 'chatacabra', 'congalala', 'guardian_doshaguma', 'guardian_fulgur_anjanath', 'gypceros', 'lagiacrus', 'rey_dau', 'seregios', 'xu_wu', 'yian_kut_ku')
    union all select 2 as weakness_id /* Thunder */, id as monster_id from monsters where code in ('balahara', 'blangonga', 'chatacabra', 'doshaguma', 'guardian_doshaguma', 'gore_magala', 'hirabami', 'mizutsune', 'nerscylla', 'rathalos', 'guardian_rathalos', 'rathian', 'seregios', 'uth_duna', 'yian_kut_ku')
    union all select 3 as weakness_id /* Water */, id as monster_id from monsters where code in ('ajarakan', 'gravios', 'guardian_ebony_odogaron', 'guardian_fulgur_anjanath', 'nu_udra', 'quematrice', 'rey_dau', 'rompopolo', 'yian_kut_ku')
    union all select 4 as weakness_id /* Dragon */, id as monster_id from monsters where code in ('arkveld', 'guardian_arkveld', 'gore_magala', 'guardian_doshaguma', 'gravios', 'guardian_fulgur_anjanath', 'lagiacrus', 'mizutsune', 'rathalos', 'guardian_rathalos', 'rathian', 'zoh_shia', 'gogmazios')
    union all select 5 as weakness_id /* Paralysis */, id as monster_id from monsters where code in ('chatacabra', 'balahara', 'guardian_ebony_odogaron', 'nerscylla', 'quematrice')
    union all select 6 as weakness_id /* Sleep */, id as monster_id from monsters where code in ('hirabami')
    union all select 7 as weakness_id /* Poison */, id as monster_id from monsters where code in ('chatacabra', 'hirabami', 'quematrice', 'xu_wu')
    union all select 9 as weakness_id /* Stun */, id as monster_id from monsters where code in ('chatacabra', 'lala_barina')
on conflict do nothing;

--------------------------- games ----------------------------
insert into monsters_gametitles (game_title_id, monster_id)
    select 16 as game_title_id, id as monster_id from monsters where code in ('ajarakan', 'arkveld', 'guardian_arkveld', 'balahara', 'blangonga', 'chatacabra', 'congalala', 'doshaguma', 'guardian_doshaguma', 'gogmazios', 'gore_magala', 'gravios', 'guardian_ebony_odogaron', 'guardian_fulgur_anjanath', 'gypceros', 'hirabami', 'jin_dahaad', 'lagiacrus', 'lala_barina', 'mizutsune', 'nerscylla', 'nu_udra', 'omega_planetes', 'quematrice', 'rathalos', 'guardian_rathalos', 'rathian', 'rey_dau', 'rompopolo', 'seregios', 'uth_duna', 'xu_wu', 'yian_kut_ku', 'zoh_shia')
on conflict do nothing;
