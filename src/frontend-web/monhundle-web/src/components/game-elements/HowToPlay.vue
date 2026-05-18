<script lang="ts" setup>
import { ComparisonResults } from '@/domain/enums/ComparisonResults';

const props = defineProps({accessibilityEnabled: Boolean});

function getComparisonResultsClass(val: ComparisonResults): string{ 
    let classes =  `result-${ComparisonResults[val].toLowerCase()}`;

    if (props.accessibilityEnabled) {
        classes += ` accessibility-${ComparisonResults[val].toLowerCase()} accessibility-on`
    }

    return classes
}
</script>

<template>
    <div class="game-lexic">

    <div class="guess-table">
        <div class="guess-table-row">
            <div class="guess-table-monster-cell">
                
            </div>
            <div class="guess-table-cell" :class="getComparisonResultsClass(ComparisonResults.Higher)">
                <span class="guess-table-cell-content">{{ t("ui.game.rules.general.higher")}}</span>
            </div>
            <div class="guess-table-cell" :class="getComparisonResultsClass(ComparisonResults.Lower)">
                <span class="guess-table-cell-content">{{ t("ui.game.rules.general.lower")}}</span>
            </div>
            <div class="guess-table-cell" :class="getComparisonResultsClass(ComparisonResults.Incorrect)">
                <span class="guess-table-cell-content">{{ t("ui.game.rules.general.incorrect")}}</span>
            </div>
            <div class="guess-table-cell" :class="getComparisonResultsClass(ComparisonResults.Partial)">
                <span class="guess-table-cell-content">{{ t("ui.game.rules.general.partial")}}</span>
            </div>
            <div class="guess-table-cell" :class="getComparisonResultsClass(ComparisonResults.Correct)">
                <span class="guess-table-cell-content">{{ t("ui.game.rules.general.correct")}}</span>
            </div>
        </div>
    </div>
</div>
</template>

<style lang="scss" scoped>
</style>