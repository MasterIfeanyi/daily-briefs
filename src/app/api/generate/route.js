import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SharedBriefing from '@/models/SharedBriefing';
import { fetchStocks } from '@/utils/fetchStocks.js';
import { fetchNews } from '@/utils/fetchNews.js';
import { fetchDog } from '@/utils/fetchDog';
import { fetchOnThisDay } from '@/utils/fetchOnThisDay';
import { generateBriefing } from '@/utils/generateBriefing';


function getTodayKeyLocal() {
    return new Date().toLocaleDateString('en-CA');
}


export async function GET() {
    try {
        await connectDB();

        const today = getTodayKeyLocal();

        const existing = await SharedBriefing.findOne({ date: today });
        if (existing) {
            return NextResponse.json({
                success: true,
                message: 'Briefing already exists for today, nothing to do.',
            });
        }

        const [stockData, newsData, dogData, onThisDayData] = await Promise.all([
            fetchStocks(),
            fetchNews(),
            fetchDog(),
            fetchOnThisDay(),
        ]);

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
                dog: aiContent.dogFunFact,
                onThisDay: onThisDayData,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Briefing generated and saved successfully.',
        });

    } catch (error) {
        console.error('Admin generate failed:', error.message);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}