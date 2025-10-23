import type IUserApi from "@/interfaces/api-contracts/IUserApi";

export class UserApiAccess implements IUserApi {
    public authenticated: boolean = false

    constructor() {}

    public authUser(): Promise<void> {
        return fetch("http://localhost:5000/user/authenticate", // TODO not hard code the URL...
            {
                method: "GET",
                credentials: "include", 
            }
        ).then( () => {this.authenticated = true}) 
    }
}
