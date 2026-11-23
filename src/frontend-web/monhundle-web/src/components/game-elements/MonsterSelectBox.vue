<script setup lang="ts">
import { getLatestIconForMonster } from '@/services/MonsterIconService';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
    items: string[];
}>();

const model = defineModel<string>(); // v-model value
const isDropdownOpen = ref(false);
const searchInput = ref<string | undefined>('');
const highlightedIndex = ref(-1);
const containerRef = ref<HTMLElement | null>(null);
const monsterSearchInputRef = ref<HTMLInputElement | null>(null);

const filteredItems = computed(() => {
    if (searchInput.value === undefined || !searchInput.value.trim()) {
        return props.items;
    }

    const term = searchInput.value.toLowerCase();

    return props.items
        .filter((code) => getMonsterLabel(code).toLowerCase().includes(term))
        .sort((a, b) => (getMonsterLabel(a) > getMonsterLabel(b) ? 1 : -1));
});

function getMonsterLabel(code: string): string {
    return t(`game.monster.${code}.name`);
}

function open() {
    isDropdownOpen.value = true;

    // Met le highlight sur l’élément sélectionné ou le premier résultat
    nextTick(() => {
        if (filteredItems.value.length === 0) {
            highlightedIndex.value = -1;
            return;
        }
        if (model.value) {
            const idx = filteredItems.value.indexOf(model.value);
            highlightedIndex.value = idx >= 0 ? idx : 0;
        } else {
            highlightedIndex.value = 0;
        }

        monsterSearchInputRef.value?.focus();
    });
}

function close() {
    isDropdownOpen.value = false;
}

function selectValue(monsterCode: string) {
    model.value = monsterCode;
    searchInput.value = getMonsterLabel(monsterCode);
    close();
}

function toggleOpen() {
    if (isDropdownOpen.value) close();
    else open();
}

function onInputFocus() {
    if (!isDropdownOpen.value) {
        open();
    }
}

function onClickOutside(event: MouseEvent) {
    if (!containerRef.value) return;
    if (!containerRef.value.contains(event.target as Node)) {
        if (model.value !== undefined) {
            selectValue(model.value);
        } else {
            close();
        }
    }
}

function onKeydown(e: KeyboardEvent) {
    if (!isDropdownOpen.value && (e.key === 'ArrowDown' || e.key === 'Enter')) {
        e.preventDefault();
        open();
        return;
    }

    if (!isDropdownOpen.value) return;

    switch (e.key) {
        case 'Escape':
            e.preventDefault();
            if (model.value !== undefined) {
                selectValue(model.value);
            }
            break;

        case 'ArrowDown':
            e.preventDefault();
            if (filteredItems.value.length === 0) return;
            highlightedIndex.value = (highlightedIndex.value + 1) % filteredItems.value.length;
            break;

        case 'ArrowUp':
            e.preventDefault();
            if (filteredItems.value.length === 0) return;
            highlightedIndex.value =
                (highlightedIndex.value - 1 + filteredItems.value.length) %
                filteredItems.value.length;
            break;

        case 'Enter':
            e.preventDefault();
            if (
                highlightedIndex.value >= 0 &&
                highlightedIndex.value < filteredItems.value.length
            ) {
                selectValue(filteredItems.value[highlightedIndex.value]!);
            }
            break;
    }
}
onMounted(() => {
    document.addEventListener('click', onClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', onClickOutside);
});

watch(
    model,
    (newval) => {
        if (newval == undefined) {
            searchInput.value = undefined;
        } else {
            searchInput.value = getMonsterLabel(newval);
        }
    },
    { immediate: true },
);
</script>

<template>
    <div class="monster-selector-container" ref="containerRef">
        <div class="monster-selector-control">
            <div class="monster-selector-wrapper">
                <img
                    v-if="!isDropdownOpen && model !== undefined && model !== ''"
                    :src="model ? getLatestIconForMonster(model) : ''"
                    :alt="model"
                    class="monster-select-input-icon"
                />

                <input
                    v-model="searchInput"
                    type="text"
                    ref="monsterSearchInputRef"
                    class="monster-search-input"
                    :placeholder="t('ui.placeholder.monsterSelector')"
                    @focus="onInputFocus"
                    @keydown="onKeydown"
                />

                <button
                    type="button"
                    class="monster-select-toggle"
                    @click="toggleOpen"
                    :aria-expanded="isDropdownOpen"
                    aria-haspopup="listbox"
                >
                    v
                </button>
            </div>
        </div>

        <!-- dropdown -->
        <div v-if="isDropdownOpen" class="monster-option-list">
            <button
                v-for="monsterCode in filteredItems"
                :key="monsterCode"
                class="monster-option"
                @click="selectValue(monsterCode)"
            >
                <img
                    class="monster-option-icon"
                    loading="lazy"
                    :src="getLatestIconForMonster(monsterCode)"
                    :alt="monsterCode"
                />
                <span class="monster-option-label"> {{ getMonsterLabel(monsterCode) }}</span>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.monster-selector-container {
    width: 80vw;
    max-width: 512px;
    min-height: 36px;
    display: flex;
    align-content: center;
    position: relative;

    /* Ligne principale input + bouton flèche */
    .monster-selector-control {
        display: flex;
        align-items: stretch;
        border-radius: 0.5rem;
        overflow: hidden;
        border: 1px solid var(--color-input-border);
        background: var(--color-input-bg);
        width: 100%;
        height: 100%;

        .monster-selector-wrapper {
            display: flex;
            align-items: center;
            flex: 1;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
        }

        .monster-select-input-icon {
            width: 2rem;
            height: 2rem;
            object-fit: contain;
            border-radius: 0.25rem;
        }

        .monster-search-input {
            flex: 1;
            border: none;
            background: transparent;
            color: var(--color-input-text);
            outline: none;

            &::placeholder {
                color: var(--color-input-placeholder);
            }
        }

        .monster-select-toggle {
            border: none;
            width: 2.2rem;
            background: transparent;
            color: var(--color-input-text);
            cursor: pointer;

            :hover {
                background: var(--color-input-hover-bg);
            }
        }
    }

    /* Dropdown */
    .monster-option-list {
        position: absolute;
        top: calc(100% + 0.25rem);
        left: 0;
        right: 0;
        max-height: 260px;
        background: var(--color-dropdown-bg);
        border-radius: 0.5rem;
        border: 1px solid var(--color-input-border);
        box-shadow: var(--shadow-dropdown);
        overflow-y: auto;
        z-index: 20;

        .monster-option {
            width: 100%;
            padding: 0.4rem 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            border: none;
            background: transparent;
            color: var(--color-input-text);
            cursor: pointer;
            text-align: left;

            .monster-option-icon {
                width: 1.75rem;
                height: 1.75rem;
                object-fit: contain;
                border-radius: 0.25rem;
            }

            .monster-option-label {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

        .monster-select-option.is-highlighted {
            background: var(--color-option-highlight-bg);
        }

        .monster-select-option.is-selected {
            background: var(--color-option-selected-bg);
        }

        .monster-select-empty {
            padding: 0.5rem 0.75rem;
            color: var(--color-text-muted);
            font-size: 0.9rem;
        }
    }
}
</style>
