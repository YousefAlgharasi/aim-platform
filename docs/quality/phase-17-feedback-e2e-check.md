# Phase 17 — Feedback E2E Check

**Task:** P17-078
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Verify the end-to-end feedback and feature request flow: user submits feedback, admin triages, feature request creation, voting, and audit logging throughout.

## Feedback Flow Verification

### Step 1: User Submits Feedback

| Check | Verified In | Status |
|-------|------------|--------|
| `POST /feedback` accepts `CreateFeedbackDto` | `FeedbackController.submitFeedback()` | PASS |
| DTO validates `category` (enum: `bug_report`, `suggestion`, `compliment`, `complaint`, `other`) | `CreateFeedbackDto` | PASS |
| DTO validates `rating` (optional, integer 1-5) | `@IsInt`, `@Min(1)`, `@Max(5)`, `@IsOptional` | PASS |
| DTO validates `title` (`@MaxLength(300)`), `body`, `sourceSurface` | `CreateFeedbackDto` | PASS |
| `userId` set from `user.internalUserId` | `FeedbackController` -> `FeedbackService.submitFeedback()` | PASS |
| Feedback saved via repository | `OperationsRepository.createFeedback()` | PASS |
| Initial status set to `new` (database default) | `user_feedback` table default | PASS |
| Audit log: `feedback_submitted` with `category` and `sourceSurface` | `FeedbackService.submitFeedback()` | PASS |

### Step 2: User Views Own Feedback

| Check | Verified In | Status |
|-------|------------|--------|
| `GET /feedback/mine` returns only user's feedback | `FeedbackController.getMyFeedback()` | PASS |
| Query filters by `user_id = $1` | `OperationsRepository.findFeedbackByUser()` | PASS |
| No public listing of all feedback | Only `mine` endpoint on user controller | PASS |

### Step 3: Admin Triages Feedback

| Check | Verified In | Status |
|-------|------------|--------|
| Admin lists all feedback behind admin guard | `FeedbackService.adminGetAllFeedback()` | PASS |
| Admin updates feedback status | `FeedbackService.adminTriageFeedback()` | PASS |
| Valid statuses: `new`, `under_review`, `accepted`, `declined`, `implemented` | `VALID_FEEDBACK_STATUSES` | PASS |
| Existence check before triage | `findFeedbackById()` throws `NotFoundException` | PASS |
| Audit log: `feedback_triaged` with `previousStatus` and `newStatus` | `FeedbackService.adminTriageFeedback()` | PASS |

## Feature Request Flow Verification

### Step 4: User Creates Feature Request

| Check | Verified In | Status |
|-------|------------|--------|
| `POST /feature-requests` accepts `CreateFeatureRequestDto` | `FeatureRequestController.createRequest()` | PASS |
| DTO validates `title` (`@MaxLength(300)`) and `description` | `CreateFeatureRequestDto` | PASS |
| `submittedBy` set from `user.internalUserId` | `FeatureRequestService.createRequest()` | PASS |
| Initial `voteCount` set to 0, `status` to `new` (database defaults) | Schema defaults | PASS |
| Audit log: `feature_request_created` with `title` | `FeatureRequestService.createRequest()` | PASS |

### Step 5: Community Views and Votes

| Check | Verified In | Status |
|-------|------------|--------|
| `GET /feature-requests` lists all requests (public) | `FeatureRequestController.listRequests()` | PASS |
| Results sorted by `vote_count DESC, created_at DESC` | `OperationsRepository.findAllFeatureRequests()` | PASS |
| Pagination supported via `limit`/`offset` query params | Controller parses query params | PASS |
| `POST /feature-requests/:id/vote` increments vote count | `FeatureRequestService.vote()` | PASS |
| Vote atomically increments via `vote_count = vote_count + 1` | `OperationsRepository.incrementFeatureRequestVote()` | PASS |
| Audit log: `feature_request_voted` with `newVoteCount` | `FeatureRequestService.vote()` | PASS |

### Step 6: Admin Triages Feature Request

| Check | Verified In | Status |
|-------|------------|--------|
| Admin updates status, priority, and triage notes | `FeatureRequestService.adminTriage()` | PASS |
| Valid statuses: `new`, `under_review`, `planned`, `in_progress`, `completed`, `declined` | `VALID_FEATURE_REQUEST_STATUSES` | PASS |
| Valid priorities: `low`, `medium`, `high`, `critical` | `VALID_FEATURE_REQUEST_PRIORITIES` | PASS |
| `triaged_by` and `triaged_at` set on triage | Repository `UPDATE` sets `triaged_by`, `triaged_at = now()` | PASS |
| Uses `COALESCE` to preserve existing values when partial update | Repository query | PASS |
| Audit log: `feature_request_triaged` with `previousStatus`, `newStatus`, `priority` | `FeatureRequestService.adminTriage()` | PASS |

## Complete Audit Trail

| Action | Audit Event | Details | Status |
|--------|------------|---------|--------|
| User submits feedback | `feedback_submitted` | `category`, `sourceSurface` | PASS |
| Admin triages feedback | `feedback_triaged` | `previousStatus`, `newStatus` | PASS |
| User creates feature request | `feature_request_created` | `title` | PASS |
| User votes on feature request | `feature_request_voted` | `newVoteCount` | PASS |
| Admin triages feature request | `feature_request_triaged` | `previousStatus`, `newStatus`, `priority` | PASS |

## Verdict

**PASS** — The complete feedback pipeline is verified: submit feedback -> admin triage -> feature request creation -> community voting -> admin triage. All mutation operations produce audit log entries. Privacy boundaries are maintained (users see only own feedback, feature requests are intentionally public for community voting).
