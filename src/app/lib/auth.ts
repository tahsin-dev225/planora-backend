
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// import { Role, UserStatus } from "../../generated/prisma/enums";
import { prisma } from "./prisma";
import { envVars } from "../../config/env";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { oAuthProxy } from "better-auth/plugins";
// If your Prisma file is located elsewhere, you can change the path

const auth = betterAuth({
    baseURL: envVars.FRONTEND_URL,
    secret: envVars.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
        // requireEmailVerification : true
    },

    // socialProviders: {
    //     google: {
    //         clientId: envVars.GOOGLE_CLIENT_ID,
    //         clientSecret: envVars.GOOGLE_CLIENT_SECRET,

    //         mapProfileUsers: (profile: { name: any; email: any; image: any; }) => {
    //             return {
    //                 role: Role.USER,
    //                 name: profile.name,
    //                 email: profile.email,
    //                 image: profile.image,
    //                 status: UserStatus.ACTIVE,
    //                 isDeleted: false,
    //                 deletedAt: null,
    //                 emailVerified: true,
    //             }
    //         }
    //     }
    // },

    emailVerification: {
        sendOnSignUp: false,
        sendOnSignIn: false,
        //     autoSignInAfterVerification: true,

    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: Role.USER
            },
            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE
            },
            isDeleted: {
                type: "boolean",
                required: true,
                defaultValue: false
            },
            deletedAt: {
                type: "date",
                required: false,
                defaultValue: null
            },
        }
    },

    // session: {
    //     expiresIn: 60 * 60 * 24, // 1 day
    //     updateAge: 60 * 60 * 24, // 1 day
    //     cookieCache: {
    //         enabled: true,
    //         maxAge: 60 * 60 * 24  // 7 days
    //     }
    // },

    // redirectURLs: {
    //     signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`,
    // },

    trustedOrigins: [envVars.FRONTEND_URL],
    advanced: {
        // disableCSRFCheck : true,
        useSecureCookies: false,
        cookies: {
            state: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/",
                    partitioned: true
                }
            },
            sessionToken: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/",
                    partitioned: true
                }
            }
        }
    },

    // advanced: {
    //     cookies: {
    //         session_token : {
    //             name : "session_token",
    //             attributes: {
    //                 httpOnly: true,
    //                 secure: true,
    //                 sameSite: "none",
    //                 partitioned: true
    //             }
    //         },
    //         state : {
    //             name : "state",
    //             attributes: {
    //                 httpOnly: true,
    //                 secure: true,
    //                 sameSite: "none",
    //                 partitioned: true
    //             }
    //         }
    //     }
    // },

    plugins: [oAuthProxy()]

});

export default auth;