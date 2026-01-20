<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ComparisonResults } from '../../domain/enums/ComparisonResults';
import { Afflictions } from '../../domain/enums/Criterias/Afflictions';
import { Weaknesses } from '../../domain/enums/Criterias/Weaknesses';
import { Classifications } from '../../domain/enums/Criterias/Classifications';
import { Biomes } from '../../domain/enums/Criterias/Biomes';
import { enumValueToKeyLower } from '../../domain/enums/EnumUtils';
import type Guess from '../../domain/Guess';
import { computed } from 'vue';

const { t } = useI18n();
const model = defineModel<Guess[]>();

function getComparisonResultsClass(val: ComparisonResults): string{ 
    return `result-${ComparisonResults[val].toLowerCase()}`
}

function getResultAriaTranslation(result: ComparisonResults, criteria: any, value: number | number[]) {
    let translatedValue: String;
    if(typeof value === "number"){
        translatedValue = enumValueToKeyLower(criteria, value) ?? ""
    } else {
        let keyArray: string[] = value.map(v => enumValueToKeyLower(criteria, v) ?? "");
        let enumname: string = criteria.enumName;

        translatedValue = keyArray.map(k => t(`game.criteria.${enumname.toLowerCase()}.${k}`)).join(", ");
    }

    return t(`accessibility.result.${ComparisonResults[result].toLocaleLowerCase()}`, {value: translatedValue})

}

function getEnumTranslationKey(enumType: any, enumVal: number): string {
    if(!enumType.enumName) {
        return "";
    }

    return `game.criteria.${enumType.enumName.toLowerCase()}.${enumValueToKeyLower(enumType, enumVal)}`;
}

function getMonsterImage(monsterCode: string) {
    return `/images/monsters/${monsterCode}.png`;
}

const hasGuesses = computed<boolean>(() => {
    return model.value !== undefined && model.value.length > 0;
});
</script>

<template>
<div class="game-lexic" v-if="hasGuesses">
    <div>
        🟥 - {{ t("ui.game.rules.general.incorrect")}}
    </div>
    <div>
        🟨 -  {{ t("ui.game.rules.general.partial")}}
    </div>
    <div>
        🟩 - {{ t("ui.game.rules.general.correct")}}
    </div>
</div>
<div class="guess-container guess-table" role="table" v-if="hasGuesses">
    <div class="guess-table-row table-header" role="row">
        <div class="guess-table-cell" role="columnheader" ></div>
        <div class="guess-table-cell" role="columnheader" ><span class="guess-table-cell-content">{{ t("ui.game.header.classification.title") }} </span></div>
        <div class="guess-table-cell" role="columnheader" ><span class="guess-table-cell-content">{{ t("ui.game.header.generation.title") }} </span></div>
        <div class="guess-table-cell" role="columnheader" ><span class="guess-table-cell-content">{{ t("ui.game.header.weakness.title") }} </span></div>
        <div class="guess-table-cell" role="columnheader" ><span class="guess-table-cell-content">{{ t("ui.game.header.affliction.title") }} </span></div>
        <div class="guess-table-cell" role="columnheader" ><span class="guess-table-cell-content">{{ t("ui.game.header.threatlvl.title") }} </span></div>
        <div class="guess-table-cell" role="columnheader" ><span class="guess-table-cell-content">{{ t("ui.game.header.habitat.title") }} </span></div>
    </div>

    <div v-for="guess in model?.slice().reverse()" class="guess-table-row" role="row">
        <div role="rowheader" class="guess-table-cell guess-table-monster-cell">
            
            <img :src="getMonsterImage(guess.monsterCode)" class="table-guess-monster-icon"></img>
            <span class="guess-table-cell-content">{{ t(`game.monster.${guess.monsterCode}.name`) }} </span>
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.classification)" class="guess-table-cell" role="cell">
            <span class="guess-table-cell-content">{{ t(getEnumTranslationKey(Classifications, guess.criterias.classification)) }}</span>
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.generation)" class="guess-table-cell" role="cell">
            <span class="guess-table-cell-content">{{ guess.criterias.generation}} </span>
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.weaknesses)" class="guess-table-cell" role="cell">
            <span class="guess-table-cell-content">{{guess.criterias.weaknesses.length > 0 ? guess.criterias.weaknesses.map(a => t(getEnumTranslationKey(Weaknesses, a))).join(", ") : "-" }} </span>
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.afflictions)" class="guess-table-cell" role="cell">
            <span class="guess-table-cell-content">{{guess.criterias.afflictions.length > 0 ? guess.criterias.afflictions.map(a => t(getEnumTranslationKey(Afflictions, a))).join(", ") : "-" }} </span>
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.threatLevel)" class="guess-table-cell" role="cell">
            <span class="guess-table-cell-content">{{ guess.criterias.threatLevel }} </span>
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.habitats)" class="guess-table-cell" role="cell">
            <span class="guess-table-cell-content">{{ guess.criterias.habitats.length > 0 ? guess.criterias.habitats.map(a => t(getEnumTranslationKey(Biomes, a))).join(", ") : "-" }} </span>
        </div>
    </div>
</div>
</template>

<style lang="scss" scoped>

.game-lexic {
    display: flex;
    justify-content: space-evenly;
    width: 100%;
    margin-top: 1rem;
}

.guess-table {
    width: max-content;
    max-width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 2fr));
    overflow-x: auto;
    gap: .5rem;

    .guess-table-row {
        display: grid;
        grid-auto-flow: row;
        grid-template-rows: 
            minmax(30px, 1fr) // monster icon line
            repeat(6, minmax(60px, .8fr)); // criteria line
        gap: .1rem;
        overflow-wrap: break-word;
        overflow: hidden;

        .guess-table-cell {
            text-align: center;
            align-content: center;
            overflow-wrap: break-word;

            :first-child {
                text-align: left;
            }

            .guess-table-cell-content {
                position: relative; 
                z-index: 1;
            }
        }

        .guess-table-monster-cell {
            display: flex;
            flex-direction: column;
            justify-content: center;
            font-size: .8rem;
            gap: .5rem;

            .table-guess-monster-icon {
                width: 2rem;
                height: 2rem;
                object-fit: contain;
                align-self: center;
            }
        }

        .result-incorrect, .result-higher, .result-lower {
            background-color: #9413139c;
            position: relative;
            z-index: 1;
        }
        .result-correct {
            background-color: #1794139c;
        }
        
        .result-partial {
            background-color: #947c139c;
        }

        .result-higher::before,
        .result-lower::before {
            content: "";
            position: absolute;      /* IMPORTANT */
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 2.5rem;
            height: 2.5rem;
            display: block;          /* assurer le rendu */
            pointer-events: none;    /* ne pas capter les clics */
            z-index: 2;
            background: #000; 
            opacity: 0.4;   /*  pour ne pas gêner la lisibilité du texte */
            z-index: 0;      /* derrière le texte */

        }

        .result-lower::before {
            transform: translate(-50%, -50%) rotate(180deg); /* on retourne la flèche */
            clip-path: polygon(
                50% 0%,
                100% 50%,
                70% 50%,
                70% 100%,
                30% 100%,
                30% 50%,
                0% 50%
            );
        }

        .result-higher::before {
            clip-path: polygon(
                50% 0%,   /* pointe en haut */
                100% 50%, /* coin droit milieu */
                70% 50%,  /* coin droit du “corps” */
                70% 100%, /* bas droit */
                30% 100%, /* bas gauche */
                30% 50%,  /* coin gauche du “corps” */
                0% 50%    /* coin gauche milieu */
            );
        }
    }
}

@media (min-width: 1024px) {
.guess-table {
    grid-auto-flow: row;
    grid-template-columns: initial;
    width: 100%;


    .guess-table-row {
        grid-auto-flow: column;
        grid-template-rows: initial;
        grid-template-columns: minmax(120px, 2fr) repeat(6, minmax(60px, 2fr));

        .guess-table-cell {
            padding: 0.5rem 0.75rem;
        }

        .guess-table-monster-cell {
            .table-guess-monster-icon {
                width: 3rem;
                height: 3rem;
            }
        }
    }
}
}

</style>