<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useGameStore } from '../../stores/GameStore';
import { ComparisonResults } from '../../domain/enums/ComparisonResults';
import { Afflictions } from '../../domain/enums/Criterias/Afflictions';
import { Weaknesses } from '../../domain/enums/Criterias/Weaknesses';
import { Classifications } from '../../domain/enums/Criterias/Classifications';
import { Biomes } from '../../domain/enums/Criterias/Biomes';
import { enumValueToKeyLower } from '../../domain/enums/EnumUtils';

const { t } = useI18n()
const store = useGameStore()

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
</script>

<template>
<div class="guess-container guess-table" role="table">
    <div class="guess-table-row table-header" role="row">
        <div class="guess-table-cell" role="columnheader" ></div>
        <div class="guess-table-cell" role="columnheader" ><span class="guess-table-cell-content">{{ $t("ui.game.header.classification.title") }} </span></div>
        <div class="guess-table-cell" role="columnheader" ><span class="guess-table-cell-content">{{ $t("ui.game.header.generation.title") }} </span></div>
        <div class="guess-table-cell" role="columnheader" ><span class="guess-table-cell-content">{{ $t("ui.game.header.weakness.title") }} </span></div>
        <div class="guess-table-cell" role="columnheader" ><span class="guess-table-cell-content">{{ $t("ui.game.header.affliction.title") }} </span></div>
        <div class="guess-table-cell" role="columnheader" ><span class="guess-table-cell-content">{{ $t("ui.game.header.threatlvl.title") }} </span></div>
        <div class="guess-table-cell" role="columnheader" ><span class="guess-table-cell-content">{{ $t("ui.game.header.habitat.title") }} </span></div>
    </div>

    <div v-for="guess in store.game?.guesses.slice().reverse()" class="guess-table-row" role="row">
        <div role="cell">
            <span class="guess-table-cell-content">{{ $t("game.monster.name." + guess.monsterCode) }} </span>
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.classification)" class="guess-table-cell" role="cell">
            <span class="guess-table-cell-content">{{ Classifications[guess.criterias.classification] }}</span>
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.generation)" class="guess-table-cell" role="cell">
            <span class="guess-table-cell-content">{{ guess.criterias.generation}} </span>
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.weaknesses)" class="guess-table-cell" role="cell">
            <span class="guess-table-cell-content">{{guess.criterias.weaknesses.length > 0 ? guess.criterias.weaknesses.map(a => Weaknesses[a]).join(", ") : "-" }} </span>
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.afflictions)" class="guess-table-cell" role="cell">
            <span class="guess-table-cell-content">{{guess.criterias.afflictions.length > 0 ? guess.criterias.afflictions.map(a => Afflictions[a]).join(", ") : "-" }} </span>
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.threatLevel)" class="guess-table-cell" role="cell">
            <span class="guess-table-cell-content">{{ guess.criterias.threatLevel }} </span>
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.habitats)" class="guess-table-cell" role="cell">
            <span class="guess-table-cell-content">{{ guess.criterias.habitats.length > 0 ? guess.criterias.habitats.map(a => Biomes[a]).join(", ") : "-" }} </span>
        </div>
    </div>
</div>
</template>

<style lang="scss" scoped>

.guess-table {
    max-width: 1024px;  
    display: grid;
    overflow: hidden;
    gap: 1rem;

    .guess-table-row {
        display: grid;
        grid-template-columns: minmax(120px, 2fr) repeat(6, minmax(60px, 2fr));
        gap: .1rem;
        overflow-wrap: break-word;

        .guess-table-cell {
            padding: 0.5rem 0.75rem;
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
            width: 2rem;
            height: 2rem;
            display: block;          /* assurer le rendu */
            pointer-events: none;    /* ne pas capter les clics */
            z-index: 2;
            background: #ffffff; 
            opacity: 0.1;   /*  pour ne pas gêner la lisibilité du texte */
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

</style>