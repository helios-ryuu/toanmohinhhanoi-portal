import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug } from '@/lib/posts';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const slug = (await params).slug;
    const format = request.nextUrl.searchParams.get('format');

    if (format === 'md') {
        try {
            const post = await getPostBySlug(slug);

            if (!post) {
                return new NextResponse('Post not found', { status: 404 });
            }

            // Reconstruct frontmatter + content for download
            const frontmatter = `---
title: "${post.title}"
description: "${post.description}"
date: "${post.date}"
${post.author ? `author: "${post.author}"` : ''}
${post.authorTitle ? `authorTitle: "${post.authorTitle}"` : ''}
${post.image ? `image: "${post.image}"` : ''}
${post.level ? `level: "${post.level}"` : ''}
${post.type ? `type: "${post.type}"` : ''}
${post.readingTime ? `readingTime: ${post.readingTime}` : ''}
${post.tags?.length ? `tags: [${post.tags.map(t => `"${t}"`).join(', ')}]` : ''}
${post.seriesId ? `seriesId: "${post.seriesId}"` : ''}
${post.seriesOrder ? `seriesOrder: ${post.seriesOrder}` : ''}
---

`;
            const markdown = frontmatter + post.content;

            return new NextResponse(markdown, {
                headers: {
                    'Content-Disposition': `attachment; filename="${slug}.md"`,
                    'Content-Type': 'text/markdown; charset=utf-8',
                },
            });
        } catch (error) {
            console.error('Download error:', error);
            return new NextResponse('Error fetching post', { status: 500 });
        }
    }

    return new NextResponse('Invalid format', { status: 400 });
}
