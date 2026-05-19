import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserConfig from '@/models/UserConfig';
import axios from 'axios';

export async function GET() {
    try {
        await connectDB();

        let config = await UserConfig.findOne();

        if (!config) {
            config = await UserConfig.create({});
        }

        return NextResponse.json({ success: true, data: config });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        await connectDB();

        const body = await request.json();

        let config = await UserConfig.findOne();

        if (!config) {
            config = await UserConfig.create(body);
        } else {
            Object.assign(config, body);
            config.updatedAt = new Date();
            await config.save();
        }

        return NextResponse.json({ success: true, data: config });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}


export async function POST(req) {
    try {
        await connectDB();
        const { lat, lon } = await req.json();

        if (!lat || !lon) {
            return NextResponse.json({ success: false, error: "Missing coordinates" }, { status: 400 });
        }

        // 1. Convert coordinates to an actual city name using OSM's free lookup API
        let cityName = 'Lagos';
        let timezone = 'Africa/Lagos';

        try {
            const geoRes = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
                { headers: { 'User-Agent': 'DailyBriefingApp/1.0' } }
            );
            cityName = geoRes.data.address.city || geoRes.data.address.town || geoRes.data.address.village || cityName;
        } catch (geoErr) {
            console.error("Reverse geocoding fell back to default:", geoErr);
        }

        // 2. Fetch Timezone context dynamically from coordinates
        try {
            const tzRes = await axios.get(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`
            );
            timezone = tzRes.data.timezone || timezone;
        } catch (tzErr) {
            console.error("Timezone matching fell back:", tzErr);
        }

        // 3. Upsert configuration details directly into MongoDB
        const updatedConfig = await UserConfig.findOneAndUpdate(
            {}, // Empty filter targets the global app profile config singleton
            {
                city: cityName,
                coordinates: { lat, lon },
                timezone: timezone,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, data: updatedConfig });
    } catch (error) {
        console.error("Failed saving profile config location:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}