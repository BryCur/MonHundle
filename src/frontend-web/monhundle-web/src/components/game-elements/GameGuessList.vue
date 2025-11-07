<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useGameStore } from '../../stores/GameStore';
import { ComparisonResults } from '../../domain/enums/ComparisonResults';
import type { EnumType } from 'typescript';

const { t } = useI18n()
const store = useGameStore()


function getComparisonResultsClass(val: ComparisonResults): string{ 
    return `result-${ComparisonResults[val].toLowerCase()}`
}

</script>

<template>
<div class="guess-container">
    <div v-for="guess in store.game?.guesses">
        <div>{{ $t("game.monster.name." + guess.monsterCode) }}</div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.classification)">
            classification : {{guess.criterias.classification }} ({{ ComparisonResults[guess.comparisonResult.classification] }})
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.generation)">
            generation : {{guess.criterias.generation}} ({{ ComparisonResults[guess.comparisonResult.generation] }})
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.weaknesses)">
            weaknesses : {{guess.criterias.weaknesses }} ({{ ComparisonResults[guess.comparisonResult.weaknesses] }})
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.afflictions)">
            affliction : {{guess.criterias.afflictions }} ({{ ComparisonResults[guess.comparisonResult.afflictions] }})
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.threatLevel)">
            threatLvl : {{guess.criterias.threatLevel }} ({{ ComparisonResults[guess.comparisonResult.threatLevel] }})
        </div>
        <div :class="getComparisonResultsClass(guess.comparisonResult.habitats)">
            habitat : {{guess.criterias.habitats }} ({{ ComparisonResults[guess.comparisonResult.habitats] }})
        </div>
    </div>
</div>
</template>