<script setup lang="ts">
import '@/assets/icons.css';
import '@/assets/utils.css';
import '@/assets/game-table.css';
import { useI18n } from 'vue-i18n';
import { ComparisonResults } from '@/domain/enums/ComparisonResults';
import { Afflictions } from '@/domain/enums/Criterias/Afflictions';
import { Weaknesses } from '@/domain/enums/Criterias/Weaknesses';
import { Classifications } from '@/domain/enums/Criterias/Classifications';
import { Biomes } from '@/domain/enums/Criterias/Biomes';
import { enumValueToKeyLower } from '@/domain/enums/EnumUtils';
import type Guess from '@/domain/Guess';
import { computed } from 'vue';
import { getLatestIconForMonster } from '@/services/MonsterIconeService';

const { t } = useI18n();
const model = defineModel<Guess[]>();
const props = defineProps({accessibilityEnabled: Boolean});

function getComparisonResultsClass(val: ComparisonResults): string{ 
    let classes =  `result-${ComparisonResults[val].toLowerCase()}`;

    if (props.accessibilityEnabled) {
        classes += ` accessibility-${ComparisonResults[val].toLowerCase()} accessibility-on`
    }

    return classes
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

function getA11yClasses(): string {
    return props.accessibilityEnabled ? 'accessibility-on' : ''
}

const hasGuesses = computed<boolean>(() => {
    return model.value !== undefined && model.value.length > 0;
});
</script>

<template>
<div class="game-lexic" v-if="hasGuesses">

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
<div class="guess-container fit-screen">
    <div class="guess-table" :class="getA11yClasses()" role="table" v-if="hasGuesses">
        <div class="guess-table-row table-header " role="row">
            <div class="guess-table-cell" role="columnheader" ></div>
            <div class="guess-table-cell" :class="getA11yClasses()" role="columnheader" >
                <span 
                    class="guess-table-cell-content tooltip-text" 
                    :tooltip-content="t('ui.game.header.classification.tooltip')"
                >
                    {{ t("ui.game.header.classification.title") }} 
                </span>
            </div>
            <div class="guess-table-cell" :class="getA11yClasses()" role="columnheader" >
                <span 
                    class="guess-table-cell-content tooltip-text" 
                    :tooltip-content="t('ui.game.header.generation.tooltip')"
                >
                    {{ t("ui.game.header.generation.title") }} 
                </span>
            </div>
            <div class="guess-table-cell" :class="getA11yClasses()" role="columnheader" >
                <span 
                    class="guess-table-cell-content tooltip-text" 
                    :tooltip-content="t('ui.game.header.weakness.tooltip')"
                >
                    {{ t("ui.game.header.weakness.title") }} 
                </span>
            </div>
            <div class="guess-table-cell" :class="getA11yClasses()" role="columnheader" >
                <span 
                    class="guess-table-cell-content tooltip-text" 
                    :tooltip-content="t('ui.game.header.affliction.tooltip')"
                >
                    {{ t("ui.game.header.affliction.title") }} 
                </span>
            </div>
            <div class="guess-table-cell" :class="getA11yClasses()" role="columnheader" >
                <span 
                    class="guess-table-cell-content tooltip-text" 
                    :tooltip-content="t('ui.game.header.threatlvl.tooltip')"
                >
                    {{ t("ui.game.header.threatlvl.title") }} 
                </span>
            </div>
            <div class="guess-table-cell" :class="getA11yClasses()" role="columnheader" >
                <span 
                    class="guess-table-cell-content tooltip-text" 
                    :tooltip-content="t('ui.game.header.habitat.tooltip')"
                >
                    {{ t("ui.game.header.habitat.title") }} 
                </span>
            </div>
        </div>
        
        <div v-for="guess in model?.slice().reverse()" class="guess-table-row" :class="getA11yClasses()" role="row">
            <div role="rowheader" class="guess-table-cell guess-table-monster-cell">
                
                <img :src="getLatestIconForMonster(guess.monsterCode)" class="table-guess-monster-icon"></img>
                <span class="guess-table-cell-content">{{ t(`game.monster.${guess.monsterCode}.name`) }} </span>
            </div>
            <div :class="getComparisonResultsClass(guess.comparisonResult.classification)" class="guess-table-cell" role="cell">
                <span class="guess-table-cell-content">{{ t(getEnumTranslationKey(Classifications, guess.criterias.classification)) }}</span>
            </div>
            <div :class="getComparisonResultsClass(guess.comparisonResult.generation)" class="guess-table-cell" role="cell">
                <span class="guess-table-cell-content">{{ guess.criterias.generation}} </span>
            </div>
            <div :class="getComparisonResultsClass(guess.comparisonResult.weaknesses)" class="guess-table-cell" role="cell">
                <span class="guess-table-cell-content" v-if="guess.criterias.weaknesses.length < 1"> - </span>
                <span class="guess-table-cell-content" v-else>
                    <ul class="icon-list">
                        <li 
                            v-for="weakness in guess.criterias.weaknesses" 
                            :class="'bg-' + enumValueToKeyLower(Weaknesses, weakness)" 
                            :aria-label="t(getEnumTranslationKey(Weaknesses, weakness))"
                            :title="t(getEnumTranslationKey(Weaknesses, weakness))"
                            class="icon-item tooltip-text"
                            :tooltip-content="t(getEnumTranslationKey(Weaknesses, weakness))"
                        ></li>
                    </ul>
                </span>

            </div>
            <div :class="getComparisonResultsClass(guess.comparisonResult.afflictions)" class="guess-table-cell" role="cell">
                <span class="guess-table-cell-content" v-if="guess.criterias.afflictions.length < 1"> - </span>
                <span class="guess-table-cell-content" v-else>
                    <ul class="icon-list">
                        <li 
                             v-for="affliction in guess.criterias.afflictions" 
                            :class="'bg-' + enumValueToKeyLower(Afflictions, affliction)" 
                            :aria-label="t(getEnumTranslationKey(Afflictions, affliction))"
                            :title="t(getEnumTranslationKey(Afflictions, affliction))"
                            class="icon-item icon"
                        ></li>
                    </ul>
                </span>
            </div>
            <div :class="getComparisonResultsClass(guess.comparisonResult.threatLevel)" class="guess-table-cell" role="cell">
                <span class="guess-table-cell-content">{{ guess.criterias.threatLevel }} </span>
            </div>
            <div :class="getComparisonResultsClass(guess.comparisonResult.habitats)" class="guess-table-cell" role="cell">
                <span class="guess-table-cell-content">{{ guess.criterias.habitats.length > 0 ? guess.criterias.habitats.map(a => t(getEnumTranslationKey(Biomes, a))).join(", ") : "-" }} </span>
            </div>
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
    padding-bottom: 2rem;
}

.guess-container{
    overflow-x: scroll; // let this container have a scrolling bar on the horizontal axis for mobile
}


.guess-table {
    width: max-content;
    max-width: none; // remove width restriction to let the table expand as required
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: repeat(auto-fit, minmax(100px, 2fr));
    gap: .5rem;


    &.accessibility-on {
        gap: 0px;
    }

    .table-header {
        position: sticky;
        left: 0;
        background-color: var(--color-background);
        z-index: 10; 
        //border: 3px green solid;

    }

    .guess-table-row {
        display: grid;
        grid-auto-flow: row;
        grid-template-rows: 
            minmax(30px, 1fr) // monster icon line
            repeat(6, minmax(60px, .8fr)); // criteria line
        gap: .1rem;
        overflow-wrap: break-word;
        
        &.accessibility-on {
            border-left: .3rem black solid;
        }


        .guess-table-cell {
            text-align: center;
            align-content: center;
            overflow-wrap: break-word;

            &.accessibility-on {
                border-top: .3rem black solid;
            }

            :first-child {
                text-align: left;
            }

            .guess-table-cell-content {
                position: relative; 
                z-index: 1;
    
                .icon-list{
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0px;
                    padding: 0;
                    margin: 0;
                    list-style: none;
                    justify-content: center;
                    
                    .icon-item{
                        list-style: none;
                        text-align: center;
                    }
                }
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
    }
}

@media (min-width: 1024px) {
.guess-container{
    overflow-x: auto; // let this container have a scrolling bar on the horizontal axis for mobile
    overflow: visible;
}
.guess-table {
    grid-auto-flow: row;
    grid-template-columns: initial;
    width: 100%;


    .guess-table-row {
        grid-auto-flow: column;
        grid-template-rows: initial;
        grid-template-columns: minmax(120px, 2fr) repeat(6, minmax(60px, 2fr));

        &.accessibility-on {
            border-top: .3rem black solid;
            border-left: none;
        }

        .guess-table-cell {
            padding: 0.3rem 0.5rem;

            &.accessibility-on {
                border-top: none;
                border-left: .3rem black solid;
            }
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