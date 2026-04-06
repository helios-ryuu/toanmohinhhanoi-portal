"use client";

import { useCallback } from "react";
import Image from "next/image";
import { FadeText, TagList } from "@/components/ui";
import StatColumns from "./PostStatColumns";
import PostCardContextMenu from "./PostCardContextMenu";
import ShareQRPopup from "../share/PostShareQRPopup";
import { usePostShareInteractions } from "@/hooks/usePostShareInteractions";
import type { PostItemProps } from "@/types/post";

export default function PostCard({
    slug,
    image,
    author,
    authorTitle,
    title,
    description,
    date,
    readingTime,
    level,
    tags,
    type,
    seriesOrder,
    onClick,
    className = ""
}: PostItemProps) {
    const {
        contextMenu, showQRPopup, linkCopied, postUrl,
        handleContextMenu, handleTouchStart, handleTouchMove, handleTouchEnd,
        handleCloseMenu, handleCopyLink, handleOpenQRPopup, handleCloseQRPopup, handleDownloadMarkdown,
    } = usePostShareInteractions(slug);

    const handleClick = useCallback(() => {
        if (!contextMenu && onClick) {
            onClick();
        }
    }, [contextMenu, onClick]);

    return (
        <>
            <div
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`
                    relative flex flex-col w-full p-3
                    rounded-xl border border-(--border-color) bg-(--post-card)
                    cursor-pointer
                    hover:border-(--border-color-hover) hover:bg-(--post-card-hover)
                    active:border-accent
                    select-none
                    ${className}
                `}
            >
                {/* Top Section */}
                <div className="flex-none">
                    {/* Image */}
                    {image && (
                        <div className="relative w-full h-48 md:h-42 mb-4">
                            {/* Glow layer */}
                            <div className="absolute -inset-1 blur-xl opacity-14">
                                <Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw" className="object-cover rounded-xl" />
                            </div>
                            {/* Image container */}
                            <div className="relative w-full h-full rounded-xl overflow-hidden z-10">
                                <Image src={image} alt={title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw" className="object-cover" />
                                <div className="absolute inset-0 bg-linear-to-t from-background/25 via-transparent to-transparent" />
                            </div>
                        </div>
                    )}

                    {/* Author */}
                    {author && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-foreground/50">
                            <FadeText
                                text={author.toUpperCase() + (authorTitle ? " • " + authorTitle : "")}
                                duration={200}
                                isVisible={true}
                                className="tracking-widest text-accent/90"
                            />
                        </div>
                    )}

                    {/* Title */}
                    {title && (
                        <h2 className="font-semibold text-lg tracking-wide line-clamp-2 leading-tight">{title}</h2>
                    )}

                    {/* Description */}
                    {description && (
                        <p className="text-xs text-foreground/70 mt-1 line-clamp-5">{description}</p>
                    )}

                    {/* Tags */}
                    {tags && (
                        <div className="mt-4 mb-2">
                            <TagList
                                tags={tags}
                                variant="compact"
                            />
                        </div>
                    )}

                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom Section */}
                <div className="flex-none">
                    <div className="w-full border-t border-(--border-color) mt-4 mb-2" />
                    <StatColumns stats={[
                        ...(date ? [{ label: "Date", value: date }] : []),
                        ...(readingTime ? [{ label: "Read", value: readingTime }] : []),
                        ...(level ? [{
                            label: "Level",
                            value: (
                                <span className={`
                                    ${level === 'beginner' ? 'bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-[4px]' : ''}
                                    ${level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded-[4px]' : ''}
                                    ${level === 'advanced' ? 'bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-[4px]' : ''}
                                `}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </span>
                            )
                        }] : []),
                    ]} />
                </div>
                {/* Series Badge */}
                {type === "series" ? (
                    <div className="mt-2 w-6/7 mx-auto flex items-center justify-center bg-accent/30 border rounded-md border-accent/50">
                        <span className="text-center text-xs font-bold tracking-widest text-accent-hover px-2 py-0.5 border-r border-accent/50">
                            SERIES
                        </span>
                        <span className="flex-1 text-center text-xs font-bold text-accent-hover px-2 py-0.5">
                            {seriesOrder ?? "?"}
                        </span>
                    </div>
                ) : (
                    <div className="mt-2 w-6/7 mx-auto flex items-center justify-center bg-blue-500/20 border rounded-md border-blue-500/40">
                        <span className="text-center text-xs font-bold tracking-widest text-blue-500 px-2 py-0.5">
                            STANDALONE
                        </span>
                    </div>
                )}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <PostCardContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    postUrl={postUrl}
                    onClose={handleCloseMenu}
                    onShareQR={handleOpenQRPopup}
                    linkCopied={linkCopied}
                    onCopyLink={handleCopyLink}
                    onDownloadMarkdown={handleDownloadMarkdown}
                />
            )}

            {/* QR Popup */}
            {showQRPopup && (
                <ShareQRPopup
                    image={image}
                    author={author}
                    authorTitle={authorTitle}
                    title={title}
                    description={description}
                    date={date}
                    readingTime={readingTime}
                    level={level}
                    tags={tags}
                    type={type}
                    seriesOrder={seriesOrder}
                    postUrl={postUrl}
                    onClose={handleCloseQRPopup}
                />
            )}
        </>
    );
}
