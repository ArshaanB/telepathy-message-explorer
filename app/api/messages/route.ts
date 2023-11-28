import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {

    const { searchParams } = new URL(request.url);
    let myCursor = parseInt(searchParams.get('id'));
    
    const findOptions = {
        take: 10,
        orderBy: {
            blockNumber: 'desc'
        }
    };
    
    if (typeof myCursor === 'number' && myCursor > 0) {
        findOptions.skip = 1;
        findOptions.cursor = {
            id: myCursor
        };
    }
    
    const messages = await prisma.message.findMany(findOptions);

    const lastMessage = messages[9];
    myCursor = lastMessage.id;

    return NextResponse.json({ data: {
        messages,
        cursor: myCursor
    } });
}