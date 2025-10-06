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
    ('ajarakan', 6, 3),
    ('arkveld', 6, 6),
    ('guardian_arkveld', 6, 6),
    ('balahara', 6, 3),
    ('blangonga', 2, 3),
    ('chatacabra', 6, 1),
    ('congalala', 2, 1),
    ('doshaguma', 6, 3),
    ('guardian_doshaguma', 6, 3),
    ('gogmazios', 4, 8),
    ('gore_magala', 4, 6),
    ('gravios', 1, 5),
    ('guardian_ebony_odogaron', 6, 4),
    ('guardian_fulgur_anjanath', 6, 4),
    ('gypceros', 1, 2),
    ('hirabami', 6, 3),
    ('jin_dahaad', 6, 6),
    ('lagiacrus', 3, 5),
    ('lala_barina', 6, 3),
    ('mizutsune', 4, 5),
    ('nerscylla', 4, 3),
    ('nu_udra', 6, 5),
    ('omega_planetes', 6, 6), -- collab, should that be included?
    ('quematrice', 6, 2),
    ('rathalos', 1, 5),
    ('guardian_rathalos', 6, 5),
    ('rathian', 1, 4),
    ('rey_dau', 6, 5),
    ('rompopolo', 6, 2),
    ('seregios', 4, 5),
    ('uth_duna', 6, 5),
    ('xu_wu', 6, 4),
    ('yian_kut_ku', 1, 2),
    ('zoh_shia', 6, 8)
;

---------------------------- classification -----------------------------