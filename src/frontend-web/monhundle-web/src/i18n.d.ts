import type en from '@/locales/en.json';

type MessageSchema = typeof en;

// complete vue-i18n module with the shape of en.json, so that t() suggests the existing keys
declare module 'vue-i18n' {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface DefineLocaleMessage extends MessageSchema {}
}
