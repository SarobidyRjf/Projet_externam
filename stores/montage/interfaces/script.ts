export interface MontageScriptAttachment {
  _id: string;
  fileName?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  uploadedAt?: string | Date | null;
}

export interface MontageScriptState {
  notes: string;
  isValidated: boolean;
  updatedAt?: string | Date | null;
  attachments: MontageScriptAttachment[];
}

export interface SaveMontageScriptPayload {
  leadId: string;
  notes?: string;
  isValidated?: boolean;
  files?: File[];
  removedAttachmentIds?: string[];
}

const toStringOrEmpty = (value: unknown) => (typeof value === 'string' ? value : '');

const normalizeAttachment = (attachment: any): MontageScriptAttachment | null => {
  if (!attachment) {
    return null;
  }

  const id = toStringOrEmpty(attachment._id ?? attachment.id);
  if (!id) {
    return null;
  }

  return {
    _id: id,
    fileName: toStringOrEmpty(attachment.fileName),
    originalName: toStringOrEmpty(attachment.originalName),
    mimeType: toStringOrEmpty(attachment.mimeType),
    size: typeof attachment.size === 'number' ? attachment.size : undefined,
    url: toStringOrEmpty(attachment.url),
    uploadedAt: attachment.uploadedAt ?? null,
  };
};

export const defaultScriptState = (): MontageScriptState => ({
  notes: '',
  isValidated: false,
  updatedAt: null,
  attachments: [],
});

export const normalizeScriptState = (value?: any | null): MontageScriptState => {
  const base = defaultScriptState();

  return {
    notes: typeof value?.notes === 'string' ? value.notes : base.notes,
    isValidated: value?.isValidated === undefined ? base.isValidated : Boolean(value.isValidated),
    updatedAt: value?.updatedAt ?? base.updatedAt,
    attachments: Array.isArray(value?.attachments)
      ? value.attachments
          .map((attachment) => normalizeAttachment(attachment))
          .filter((attachment): attachment is MontageScriptAttachment => Boolean(attachment))
      : base.attachments,
  };
};
