import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { promises as fs } from 'fs';

export async function GET(req: NextRequest) {
    try {
        const key: string = req.nextUrl.searchParams.get('key') || '';
        const keyList = [
            "B2B@2023",
            "B2C@2023",
            "B2A@2023"
        ];
        const filePath = join(process.cwd(), '/nhrepon.js');
        const fileContent = await fs.readFile(filePath, 'utf8');

        if(keyList.includes(key)){
            return new Response(fileContent, {
                headers: {
                    'Content-Type': 'application/javascript',
                    'Cache-Control': 'public, max-age=3600',
                },
            });
        }else{
            return NextResponse.json({status: "unauthorized", message: "You are not authorized to access this file"});
        }
    } catch (error) {
        console.error('Error reading file:', error);
        return new Response('File not found', { status: 404 });
    }
}
