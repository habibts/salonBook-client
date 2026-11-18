import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";


const client = new MongoClient("mongodb://<db_username>:<db_password>@ac-bqzlc8s-shard-00-00.6my06uv.mongodb.net:27017,ac-bqzlc8s-shard-00-01.6my06uv.mongodb.net:27017,ac-bqzlc8s-shard-00-02.6my06uv.mongodb.net:27017/?ssl=true&replicaSet=atlas-14p3me-shard-0&authSource=admin");
const db = client.db('salonBook');

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

});