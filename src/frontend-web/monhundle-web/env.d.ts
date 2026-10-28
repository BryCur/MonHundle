/// <reference types="vite/client" />

import 'vue-router';

// complete vue-router module by redefining the RouteMetas (meta data in routes objects)
declare module 'vue-router' {
    interface RouteMeta {
        public?: boolean; // skips the authentication guard
        bare?: boolean; // hides the navigation header
    }
}
