import type { FileUIPart, SourceDocumentUIPart } from 'ai';
import {
	FileTextIcon,
	GlobeIcon,
	ImageIcon,
	Music2Icon,
	PaperclipIcon,
	VideoIcon
} from '@lucide/svelte';
import { getContext } from 'svelte';

export type AttachmentData =
	| (FileUIPart & { id: string })
	| (SourceDocumentUIPart & { id: string });

export type AttachmentMediaCategory =
	| 'image'
	| 'video'
	| 'audio'
	| 'document'
	| 'source'
	| 'unknown';

export type AttachmentVariant = 'grid' | 'inline' | 'list';

export const mediaCategoryIcons: Record<AttachmentMediaCategory, typeof ImageIcon> = {
	audio: Music2Icon,
	document: FileTextIcon,
	image: ImageIcon,
	source: GlobeIcon,
	unknown: PaperclipIcon,
	video: VideoIcon
};

export function getMediaCategory(data: AttachmentData): AttachmentMediaCategory {
	if (data.type === 'source-document') {
		return 'source';
	}
	const mediaType = data.mediaType ?? '';
	if (mediaType.startsWith('image/')) return 'image';
	if (mediaType.startsWith('video/')) return 'video';
	if (mediaType.startsWith('audio/')) return 'audio';
	if (mediaType.startsWith('application/') || mediaType.startsWith('text/')) return 'document';
	return 'unknown';
}

export function getAttachmentLabel(data: AttachmentData): string {
	if (data.type === 'source-document') {
		return data.title || data.filename || 'Source';
	}
	const category = getMediaCategory(data);
	return data.filename || (category === 'image' ? 'Image' : 'Attachment');
}

interface AttachmentsContextValue {
	variant: AttachmentVariant;
}

export interface AttachmentContextValue {
	data: AttachmentData;
	mediaCategory: AttachmentMediaCategory;
	onRemove?: () => void;
	variant: AttachmentVariant;
}

export const attachmentsKey = Symbol('attachments');
export const attachmentKey = Symbol('attachment');

export function useAttachmentsContext(): AttachmentsContextValue {
	return (getContext(attachmentsKey) as AttachmentsContextValue) ?? { variant: 'grid' };
}

export function useAttachmentContext(): AttachmentContextValue {
	const ctx = getContext(attachmentKey) as AttachmentContextValue | null;
	if (!ctx) {
		throw new Error('Attachment components must be used within <Attachment>');
	}
	return ctx;
}
