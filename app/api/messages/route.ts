import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client'

import { formatMessages, fetchMessagesBatch, getCurrentBlock } from "../../utils/messages";

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
    
    let messages = await prisma.message.findMany(findOptions);

    if (messages.length < 10) {
        const lastElement = await prisma.message.findUnique({
            where: {
                id: myCursor
            }
        });
        const lastBlock = lastElement ? lastElement.blockNumber : await getCurrentBlock();
        const messagesBatch = await fetchMessagesBatch(0, lastBlock, 0);
        const messagesBatchFormatted = formatMessages(messagesBatch);
        
        const createMessages = messagesBatchFormatted.map(async (message: any) => {
            // Ensures no duplicate messages are created.
            const existingMessage = await prisma.message.findUnique({
                where: {
                    nonce: message.nonce
                }
            });
            if (!existingMessage) {
                return prisma.message.create({
                    data: {
                        nonce: message.nonce,
                        messageHash: message.messageHash,
                        messageBytes: message.messageBytes,
                        transactionHash: message.transactionHash,
                        blockNumber: message.blockNumber,
                    }
                })
            }
        });

        await Promise.all(createMessages);
        messages = await prisma.message.findMany(findOptions);
    }

    const lastMessage = messages[9];
    myCursor = lastMessage.id;

    return NextResponse.json({ data: {
        messages,
        cursor: myCursor
    } });
}