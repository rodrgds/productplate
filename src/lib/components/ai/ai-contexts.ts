import type { FileUIPart, SourceDocumentUIPart, ToolUIPart } from 'ai';
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
	if (data.type === 'source-document') return 'source';
	const mediaType = data.mediaType ?? '';
	if (mediaType.startsWith('image/')) return 'image';
	if (mediaType.startsWith('video/')) return 'video';
	if (mediaType.startsWith('audio/')) return 'audio';
	if (mediaType.startsWith('application/') || mediaType.startsWith('text/')) return 'document';
	return 'unknown';
}

export function getAttachmentLabel(data: AttachmentData): string {
	if (data.type === 'source-document') return data.title || data.filename || 'Source';
	const category = getMediaCategory(data);
	return data.filename || (category === 'image' ? 'Image' : 'Attachment');
}

export interface AttachmentsContextValue {
	variant: AttachmentVariant;
}

export interface AttachmentContextValue {
	data: AttachmentData;
	mediaCategory: AttachmentMediaCategory;
	onRemove?: () => void;
	variant: AttachmentVariant;
}

export interface ChainOfThoughtContextValue {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}

export interface MessageBranchContextType {
	currentBranch: number;
	totalBranches: number;
	goToPrevious: () => void;
	goToNext: () => void;
	setTotalBranches: (count: number) => void;
}

export interface ReasoningContextValue {
	isStreaming: boolean;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	duration: number | undefined;
}

export type ToolUIPartApproval =
	| { id: string; approved?: never; reason?: never }
	| { id: string; approved: boolean; reason?: string }
	| undefined;

export interface MicSelectorContextType {
	devices: MediaDeviceInfo[];
	value: string | undefined;
	onValueChange: (value: string) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	width: number;
	setWidth: (width: number) => void;
	loading: boolean;
	hasPermission: boolean;
	loadDevices: () => Promise<void>;
}

export interface ConfirmationContextValue {
	approval: ToolUIPartApproval;
	state: ToolUIPart['state'];
}

const keys = {
	attachments: Symbol('attachments'),
	attachment: Symbol('attachment'),
	chainOfThought: Symbol('chain-of-thought'),
	messageBranch: Symbol('message-branch'),
	reasoning: Symbol('reasoning'),
	confirmation: Symbol('confirmation'),
	micSelector: Symbol('mic-selector')
};

export function useAttachmentsContext(): AttachmentsContextValue {
	return (getContext(keys.attachments) as AttachmentsContextValue) ?? { variant: 'grid' };
}

export function useAttachmentContext(): AttachmentContextValue {
	const ctx = getContext(keys.attachment) as AttachmentContextValue | null;
	if (!ctx) throw new Error('Attachment components must be used within <Attachment>');
	return ctx;
}

export function useChainOfThought(): ChainOfThoughtContextValue {
	const ctx = getContext(keys.chainOfThought) as ChainOfThoughtContextValue | null;
	if (!ctx) throw new Error('ChainOfThought components must be used within ChainOfThought');
	return ctx;
}

export function useMessageBranch(): MessageBranchContextType {
	const ctx = getContext(keys.messageBranch) as MessageBranchContextType | null;
	if (!ctx) throw new Error('MessageBranch components must be used within MessageBranch');
	return ctx;
}

export function useReasoning(): ReasoningContextValue {
	const ctx = getContext(keys.reasoning) as ReasoningContextValue | null;
	if (!ctx) throw new Error('Reasoning components must be used within Reasoning');
	return ctx;
}

export function useConfirmation(): ConfirmationContextValue {
	const ctx = getContext(keys.confirmation) as ConfirmationContextValue | null;
	if (!ctx) throw new Error('Confirmation components must be used within Confirmation');
	return ctx;
}

export function useMicSelector(): MicSelectorContextType {
	const ctx = getContext(keys.micSelector) as MicSelectorContextType | null;
	if (!ctx) throw new Error('MicSelector components must be used within MicSelector');
	return ctx;
}

export { keys as contextKeys };
