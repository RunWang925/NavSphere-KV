import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getResource, saveResource } from '@/lib/kv'
import { saveAsset, deleteAsset } from '@/lib/asset-storage'
import type { ResourceMetadata } from '@/types/resource-metadata'

export const runtime = 'edge'

export async function GET() {
    try {
        const data = await getResource() as ResourceMetadata
        if (!data?.metadata || !Array.isArray(data.metadata)) {
            throw new Error('Invalid data structure');
        }
        return NextResponse.json(data)
    } catch (error) {
        console.error('Failed to fetch resource metadata:', error)
        return NextResponse.json({ error: 'Failed to fetch resource metadata' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { image } = await request.json();
        const base64Data = image.split(",")[1];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        const { key, url: imageUrl } = await saveAsset(binaryData, 'png');

        const metadata = await getResource() as ResourceMetadata;
        metadata.metadata.unshift({
            commit: key,
            hash: key,
            path: imageUrl
        });

        await saveResource(metadata);

        return NextResponse.json({ success: true, imageUrl });
    } catch (error) {
        console.error('Failed to save resource:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to save resource' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { resourceHashes } = await request.json();
        if (!Array.isArray(resourceHashes) || resourceHashes.length === 0) {
            return NextResponse.json({ error: 'Invalid resource hashes' }, { status: 400 });
        }

        const metadata = await getResource() as ResourceMetadata;
        const originalCount = metadata.metadata.length;

        for (const hash of resourceHashes) {
            const item = metadata.metadata.find(m => m.hash === hash);
            if (item) {
                const key = item.path.replace('/api/asset/', '');
                try {
                    await deleteAsset(key);
                } catch (e) {
                    console.warn('Failed to delete asset file:', e);
                }
            }
        }

        metadata.metadata = metadata.metadata.filter(item => !resourceHashes.includes(item.hash));
        const deletedCount = originalCount - metadata.metadata.length;

        await saveResource(metadata);

        return NextResponse.json({
            success: true,
            deletedCount,
            message: `成功删除 ${deletedCount} 个资源`
        });
    } catch (error) {
        console.error('Failed to delete resources:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete resources' },
            { status: 500 }
        );
    }
}
