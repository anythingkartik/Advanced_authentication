import cron from 'node-cron'; // Import node-cron using terminall npm install node-cron
import { User } from '../models/userModel.js'; // Import User model

//automatically remove unverified accounts after 24 hours
export const removeUnverfiedAccounts = ()=>{ //30 minutes
    cron.schedule("*/30 * * * *",async()=>{
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000); //30 minutes ago
        const usersToDelete= await User.deleteMany({
            accountVerified: false,
            createdAt: {$lt: thirtyMinutesAgo},
        });
        //i can also console.log the usersToDelete to see the users that are deleted
});
};