import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./app/lib/mongodb"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

const providers = [
    Credentials({
        credentials: {
            email: {},
            password: {}
        },
        authorize: async (c) => {
            if(c.password !== 'password' || c.email !== 'test@example.com') {
                return null
            }
            
            return {
                id: "test",
                name: "Test User",
                email: "test@example.com"
            }
        }
    }),
    Google,
]

// export const providerMap = providers
//     .map((provider) => {
//         if (typeof provider === "function") {
//             const providerData = provider()
//             return { id: providerData.id, name: providerData.name }
//         } else {
//             return { id: provider.id, name: provider.name }
//         }
//     })
//     .filter((provider) => provider.id !== "credentials")

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: MongoDBAdapter(clientPromise),
    providers,
    // pages: {
    //     signIn: "/signin",
    // },
})