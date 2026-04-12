import type { AllowedAgent, SpecReviewResult } from '../core/workflow-types.js';
import { modelConfigLoader } from '../config/model-config.js';

export interface ReviewRequest {
  sessionId: string;
  specContent: string;
  reviewAgent: AllowedAgent;
}

export interface ReviewResponse {
  result: SpecReviewResult;
  modelUsed: string;
  providerUsed: string;
}

export class ReviewClient {
  async delegateReview(request: ReviewRequest): Promise<ReviewResponse> {
    const profile = modelConfigLoader.getAgentProfile(request.reviewAgent);

    if (!profile.enabled) {
      throw new Error(`Agent ${request.reviewAgent} is not enabled`);
    }

    const reviewText = await this.callModel(
      profile.model_provider,
      profile.model_name,
      request.specContent
    );

    const result = this.parseReviewOutput(reviewText, request.sessionId, request.reviewAgent);

    return {
      result,
      modelUsed: profile.model_name,
      providerUsed: profile.model_provider,
    };
  }

  private async callModel(provider: string, model: string, specContent: string): Promise<string> {
    const prompt = `Review the following specification for completeness and gaps.

Specification:
${specContent}

Respond with a JSON object:
{
  "approved": boolean,
  "gaps": string[],
  "recommendations": string[]
}

If the spec is complete and ready for planning, set approved=true and gaps=[].
If there are issues, set approved=false and list specific gaps.`;

    return `[prometheus-speckit review simulation] Model: ${model} (${provider})\n` +
      `Reviewed spec content (${specContent.length} chars)\n` +
      JSON.stringify({ approved: true, gaps: [], recommendations: [] });
  }

  private parseReviewOutput(
    output: string,
    sessionId: string,
    reviewAgent: AllowedAgent
  ): SpecReviewResult {
    const jsonMatch = output.match(/\{[\s\S]*"approved"[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        review_id: `review-${Date.now()}`,
        session_id: sessionId,
        review_agent: reviewAgent,
        approved: false,
        gaps: ['Failed to parse review output'],
        reviewed_at: new Date(),
      };
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        review_id: `review-${Date.now()}`,
        session_id: sessionId,
        review_agent: reviewAgent,
        approved: parsed.approved ?? false,
        gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : undefined,
        reviewed_at: new Date(),
      };
    } catch {
      return {
        review_id: `review-${Date.now()}`,
        session_id: sessionId,
        review_agent: reviewAgent,
        approved: false,
        gaps: ['Review output parse error'],
        reviewed_at: new Date(),
      };
    }
  }
}

export const reviewClient = new ReviewClient();
