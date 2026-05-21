import connectDB from '../../src/lib/mongodb.js';
import SharedBriefing from '../../src/models/SharedBriefing.js';
import { fetchStocks } from '../../src/utils/fetchStocks.js';
import { fetchNews } from '../../src/utils/fetchNews.js';
import { fetchDog } from '../../src/utils/fetchDog.js';
import { fetchOnThisDay } from '../../src/utils/fetchOnThisDay.js';
import { generateBriefing } from '../../src/utils/generateBriefing.js';


function getTodayKey() {
    return new Date().toLocaleDateString('en-CA');
}


export default async function handler() {
    try {
        await connectDB();

        const today = getTodayKey();

        const existing = await SharedBriefing.findOne({ date: today });
        if (existing) {
            console.log('Briefing already exists for today, skipping.');
            return new Response('Already done', { status: 200 });
        }

        console.log('Fetching stocks and news...');
        const [stockData, newsData, dogData, onThisDayData] = await Promise.all([
            fetchStocks(),
            fetchNews(),
            fetchDog(),
            fetchOnThisDay(),
        ]);

        console.log('Calling Gemma...');
        const aiContent = await generateBriefing(newsData, stockData, dogData.breed);

        await SharedBriefing.create({
            date: today,
            content: {
                stocks: {
                    us: stockData.us,
                    world: stockData.world,
                    commentary: aiContent.stockCommentary,
                },
                wordOfTheDay: aiContent.wordOfTheDay,
                joke: aiContent.joke,
                news: aiContent.news || [],
                dog: {
                    imageUrl: dogData.imageUrl,
                    breed: dogData.breed,
                    funFact: aiContent.dogFunFact,
                },
                onThisDay: onThisDayData,
            },
        });

        console.log('Briefing saved successfully for', today);
        return new Response('Done', { status: 200 });

    } catch (err) {
        console.error('Scheduled briefing failed:', err);
        return new Response(err.message, { status: 500 });
    }
}

export const config = {
    schedule: '0 5 * * *',
};