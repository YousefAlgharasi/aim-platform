export type VoiceFeedbackRating = 'helpful' | 'not_helpful';

export interface SubmitVoiceFeedbackRequestBody {
  readonly messageId: string;
  readonly rating: VoiceFeedbackRating;
  readonly comment?: string;
}

export interface SubmitVoiceFeedbackResponse {
  readonly feedbackId: string;
  readonly recorded: boolean;
}
