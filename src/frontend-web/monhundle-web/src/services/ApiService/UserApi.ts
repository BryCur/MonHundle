import type IUserApi from "@/domain/interfaces/api-contracts/IUserApi";

import { apiFetch } from "./ApiBaseAccess";

export class UserApi implements IUserApi {
    public authenticated: boolean = false

    constructor() {}

    public authUser(): Promise<void> {
        return apiFetch("/user/authenticate",
            {
                method: "GET",
                credentials: "include", 
            }
        ).then( () => {this.authenticated = true}) 
    }
}
