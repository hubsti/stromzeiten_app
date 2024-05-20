import { validateUser, type User } from "$lib/types";
import type { PageServerLoad } from "./$types";


export const load: PageServerLoad = async (event) => {

    async function fetchUsers() {
        const result = await fetch(
            "https://dummyjson.com/users?select=age,firstName,lastName,weight,height&limit=10"
        );

        const { users } = await result.json();

        if (!Array.isArray(users)) {
            return [];
        }

        let validatedUsers: User[] = [];

        for (let user of users) {
            if (!validateUser(user)) {
                console.log(user);
                return [];
            }

            validatedUsers.push(user);
        }

        return validatedUsers;
    }

    return {
        users: await fetchUsers(),
    };
}