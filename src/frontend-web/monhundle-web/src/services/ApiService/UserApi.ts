import type IUserApi from "@/domain/interfaces/api-contracts/IUserApi";

import { isUUID } from "@/domain/Utils";
import { setStoredUserId } from "@/services/LocalStorageService";
import { apiFetch } from "./ApiBaseAccess";

export class UserApi implements IUserApi {
    public authenticated: boolean = false

    constructor() {}

    public async authUser(): Promise<void> {
        const response = await apiFetch("/user/authenticate", { method: "GET" });

        if (!response.ok) {
            this.authenticated = false;
            throw new Error(`Authentication failed with status ${response.status}`);
        }

        // the API returns the resolved (possibly newly created) player id as a JSON string.
        // Parse defensively: a 200 with an unexpected body (empty, a proxy error page, plain text)
        // must not crash auth. We only trust the value if it is a well-formed UUID.
        const rawBody = await response.text();
        let userId: unknown;
        try {
            userId = JSON.parse(rawBody);
        } catch {
            userId = undefined;
        }

        if (typeof userId !== "string" || !isUUID(userId)) {
            this.authenticated = false;
            throw new Error("Authentication response did not contain a valid user id");
        }

        // persist it so every subsequent request can send it as a bearer token
        setStoredUserId(userId);
        this.authenticated = true;
    }
}
