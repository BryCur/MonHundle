<script setup lang="ts">
import { getLatestIconForMonster } from '@/services/MonsterIconService';
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const props = defineProps<{
    items: string[];
}>();

const model = defineModel<string>(); // v-model value
const isDropdownOpen = ref(false);
const searchInput = ref<string>('');
const highlightedIndex = ref(-1);
const containerRef = ref<HTMLElement | null>(null);
const monsterSearchInputRef = ref<HTMLInputElement | null>(null);
const monsterOptionDropdown = ref<HTMLElement | null>(null);

const emit = defineEmits<{ submit: [] }>();
defineExpose({
    focus: () => monsterSearchInputRef.value?.focus(),
});

// sorted items is only recomputed if the reference list or the language changes.
const sortedItems = computed(() => {
    const comparator = new Intl.Collator(locale.value);
    return [...props.items].sort((a, b) =>
        comparator.compare(getMonsterLabel(a), getMonsterLabel(b)),
    );
});

const filteredItems = computed(() => {
    const term = searchInput.value.trim().toLowerCase();

    if (!term) {
        return sortedItems.value;
    }

    return sortedItems.value.filter((code) => getMonsterLabel(code).toLowerCase().includes(term));
});

// keep the current index visible
watch(
    highlightedIndex,
    (index) => {
        if (index < 0) return;
        monsterOptionDropdown.value?.children[index]?.scrollIntoView({ block: 'nearest' });
    },
    { flush: 'post' },
);

function getMonsterLabel(code: string): string {
    return t(`game.monster.${code}.name`);
}

function open() {
    isDropdownOpen.value = true;
    searchInput.value = '';

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

function close(selectedCode: string | undefined = model.value) {
    isDropdownOpen.value = false;
    highlightedIndex.value = -1;
    searchInput.value = selectedCode ? getMonsterLabel(selectedCode) : '';
}

function selectValue(monsterCode: string) {
    model.value = monsterCode;
    close(monsterCode);
}

function toggleOpen() {
    if (isDropdownOpen.value) close();
    else open();
}

function onInputClick() {
    if (!isDropdownOpen.value) {
        open();
    }
}

function onFocusOut(event: FocusEvent) {
    if (containerRef.value?.contains(event.relatedTarget as Node)) {
        return;
    }

    if (isDropdownOpen.value) {
        close();
    }
}

function onKeydown(e: KeyboardEvent) {
    if (!isDropdownOpen.value) {
        if (e.key === 'Enter' && model.value) {
            e.preventDefault();
            emit('submit');
        } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();
            open();
        }
        return;
    }

    if (!isDropdownOpen.value) return;

    switch (e.key) {
        case 'Escape':
            e.preventDefault();
            close();
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

watch(
    model,
    (newval) => {
        if (newval == undefined) {
            searchInput.value = '';
        } else {
            searchInput.value = getMonsterLabel(newval);
        }
    },
    { immediate: true },
);
</script>

<template>
    <div class="monster-selector-container" ref="containerRef" @focusout="onFocusOut">
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
                    :placeholder="
                        model ? getMonsterLabel(model) : t('ui.placeholder.monsterSelector')
                    "
                    @click="onInputClick"
                    @keydown="onKeydown"
                    @input="
                        highlightedIndex = filteredItems.length > 0 ? 0 : -1;
                        isDropdownOpen = true;
                    "
                />

                <button
                    type="button"
                    class="monster-select-toggle"
                    @click="toggleOpen"
                    @mousedown.prevent
                    :aria-expanded="isDropdownOpen"
                    aria-haspopup="listbox"
                >
                    v
                </button>
            </div>
        </div>

        <!-- dropdown -->
        <div v-if="isDropdownOpen" class="monster-option-list" ref="monsterOptionDropdown">
            <button
                v-for="(monsterCode, index) in filteredItems"
                :key="monsterCode"
                class="monster-option"
                :class="{
                    'is-highlighted': index === highlightedIndex,
                    'is-selected': monsterCode === model,
                }"
                @click="selectValue(monsterCode)"
                @mousemove="highlightedIndex = index"
                @mousedown.prevent
            >
                <img
                    class="monster-option-icon"
                    loading="lazy"
                    :src="getLatestIconForMonster(monsterCode)"
                    :alt="monsterCode"
                />
                <span class="monster-option-label"> {{ getMonsterLabel(monsterCode) }}</span>
            </button>

            <div v-if="filteredItems.length === 0" class="monster-select-empty">
                {{ t('ui.page.game.search.notFound') }}
            </div>
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

            &.is-highlighted {
                background: var(--color-option-highlight-bg);
            }

            &.is-selected {
                box-shadow: inset 3px 0 0 var(--color-option-selected-accent);
                font-weight: 600;
            }
        }

        .monster-select-empty {
            padding: 0.5rem 0.75rem;
            color: var(--color-text-muted);
            font-size: 0.9rem;
        }
    }
}
</style>
