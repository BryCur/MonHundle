<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
    items: string[]
}>()

const model = defineModel<string>()
const isDropdownOpen = ref(false);
const searchInput = ref<string | undefined>("");
const highlightedIndex = ref(-1);
const containerRef = ref<HTMLElement | null>(null);
const monsterSearchInputRef = ref<HTMLInputElement | null>(null);

function getMonsterImage(monsterCode: string) {
    return `/images/monsters/${monsterCode}.png`;
}

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void
}>();

const filteredItems = computed(() => {
    if (searchInput.value === undefined || !searchInput.value.trim()) {
        return props.items;
    }
    console.log("ouai grave");

    const term = searchInput.value.toLowerCase();

    return props.items.filter(code => getMonsterLabel(code).toLowerCase().includes(term));
});

function getMonsterLabel(code: string): string {
  return t("game.monster.name." + code);
}

function open() {
  isDropdownOpen.value = true

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
    monsterSearchInputRef.value?.focus()
  })
}

function close() {
  isDropdownOpen.value = false;
}

function selectValue(monsterCode: string) {
    model.value=  monsterCode;
    searchInput.value = getMonsterLabel(monsterCode);
    close();
};

function toggleOpen() {
  if (isDropdownOpen.value) close();
  else open();
}

function onInputFocus(e: Event){
    if (!isDropdownOpen.value) {
        open();
    }
}

function onClickOutside(event: MouseEvent) {
    if (!containerRef.value) return
    if (!containerRef.value.contains(event.target as Node)) {
        if(model.value !== undefined) {
            selectValue(model.value)
        } else {
            close()
        }
    }
}

function onKeydown(e: KeyboardEvent) {
    if (!isDropdownOpen.value && (e.key === 'ArrowDown' || e.key === 'Enter')) {
        e.preventDefault()
        open()
        return
    }

    if (!isDropdownOpen.value) return

    switch (e.key) {
        case 'Escape':
                e.preventDefault()
                if(model.value !== undefined) {
                    selectValue(model.value)
                }
        break

        case 'ArrowDown':
            e.preventDefault()
            if (filteredItems.value.length === 0) return
            highlightedIndex.value = (highlightedIndex.value + 1) % filteredItems.value.length
        break

        case 'ArrowUp':
            e.preventDefault()
            if (filteredItems.value.length === 0) return
            highlightedIndex.value = (highlightedIndex.value - 1 + filteredItems.value.length) % filteredItems.value.length
        break

        case 'Enter':
            e.preventDefault()
            if (
                highlightedIndex.value >= 0 &&
                highlightedIndex.value < filteredItems.value.length
            ) {
                selectValue(filteredItems.value[highlightedIndex.value]!)
            }
        break
    }
}
onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

watch(model, (newval, oldval) => {
    if(newval == undefined) {
        searchInput.value = undefined
    } else {
      searchInput.value = getMonsterLabel(newval)
    }
}, {immediate: true})
</script>

<template>
    <div class="monster-selector-container" ref="containerRef">
        <div class="monster-selector-control">
            <div class="monster-selector-wrapper">
                <img 
                    v-if="!isDropdownOpen && model !== undefined && model !== ''" 
                    :src="model ? getMonsterImage(model) : ''" 
                    :alt="model"
                    class="monster-select-input-icon"
                ></img>
                
                <input
                    v-model="searchInput"
                    type="text"
                    ref="monsterSearchInputRef"
                    class="monster-search-input"
                    :placeholder="t('ui.placeholder.monsterSelector')"
                    @focus="onInputFocus"
                    @keydown="onKeydown"
                ></input>

                <button
                    type="button"
                    class="monster-select-toggle"
                    @click="toggleOpen"
                    :aria-expanded="isDropdownOpen"
                    aria-haspopup="listbox"
                >v</button>
            </div>
        </div>

        <!-- dropdown -->
        <div v-if="isDropdownOpen" class="monster-option-list">
            <button v-for="monsterCode in filteredItems" class="monster-option" @click="selectValue(monsterCode)">
                <img class="monster-option-icon" :src="getMonsterImage(monsterCode)" :alt="monsterCode"></img>
                <span class="monster-option-label"> {{ $t("game.monster.name." + monsterCode) }}</span>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.monster-selector-container{
    width: 100%;
    max-width: 1024px;
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
        border: 1px solid #444;
        background: #222;
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
            width: 32px;
            height: 32px;
            object-fit: contain;
            border-radius: 0.25rem;
        }
        
        .monster-search-input {
            flex: 1;
            border: none;
            background: transparent;
            color: #f5f5f5;
            outline: none;
        
            &::placeholder {
                color: #888;
            }
        }

        .monster-select-toggle {
            border: none;
            width: 2.2rem;
            background: transparent;
            color: #f5f5f5;
            cursor: pointer;
            
            :hover {
                background: #3d3d3d;
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
        background: #181818;
        border-radius: 0.5rem;
        border: 1px solid #444;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.6);
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
            color: #f5f5f5;
            cursor: pointer;
            text-align: left;

            .monster-option-icon {
                width: 28px;
                height: 28px;
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
            background: #333;
        }
    
        .monster-select-option.is-selected {
            background: #2d3a5c;
        }
    
        .monster-select-empty {
            padding: 0.5rem 0.75rem;
            color: #aaa;
            font-size: 0.9rem;
        }
    }
}
</style>