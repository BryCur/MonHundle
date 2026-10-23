import type { IErrorNavigator } from '@/domain/interfaces/IErrorNavigator';
import { paths } from '@/router';
import type { Router } from 'vue-router';

export function createErrorRouterNavigator(router: Router): IErrorNavigator {
    return {
        isOnErrorPage: () => router.currentRoute.value.path === paths.error,

        showErrorPage: (reason) => {
            router
                .replace({
                    path: paths.error,
                    query: { reason, from: router.currentRoute.value.fullPath },
                })
                .catch((err) =>
                    console.error('[error navigator] could not show the error page', err),
                );
        },
    };
}
