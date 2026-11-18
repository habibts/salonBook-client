import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";


const client = new MongoClient(process.env.MONGODB_URI as string);
export const db = client.db('salonBook');

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: { 
    enabled: true, 
  }, 
  baseURL: process.env.BETTER_AUTH_URL, 
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        },
    },

  /*
   * SalonBook has exactly two roles: "customer" and "admin".
   *
   * `input: false` prevents a client from setting or changing its own role
   * (Better Auth rejects the field with FIELD_NOT_ALLOWED on update), and
   * `defaultValue` makes every new account a customer. Accounts created before
   * this field existed simply have no value stored, which is read as
   * "customer" everywhere in the app.
   */
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
    },
  },
});