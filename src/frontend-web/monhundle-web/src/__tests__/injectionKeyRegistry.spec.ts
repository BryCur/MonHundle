import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, type InjectionKey } from 'vue';
import { injectStrict } from '@/injectionKeyRegistry';

const testKey: InjectionKey<{ name: string }> = Symbol('testService');

// minimal component resolving the key during setup, like the views do
function mountConsumer(provide: Record<symbol, unknown>) {
    let resolved: unknown;

    const Consumer = defineComponent({
        setup() {
            resolved = injectStrict(testKey);
            return () => null;
        },
    });

    // warnHandler silences Vue's "injection not found" warning
    mount(Consumer, { global: { provide, config: { warnHandler: vi.fn() } } });

    return resolved;
}

describe('injectStrict', () => {
    it('returns the value provided for the key', () => {
        const service = { name: 'provided' };

        expect(mountConsumer({ [testKey]: service })).toBe(service);
    });

    it('throws an error naming the key when nothing is provided for it', () => {
        expect(() => mountConsumer({})).toThrow(
            'No provider found for injection key "testService"',
        );
    });
});
