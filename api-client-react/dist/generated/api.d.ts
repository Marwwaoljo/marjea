import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AuditEventsPage, Case, CaseInput, ClaimEvidence, ClaimLineage, ClaimObservation, ClaimRecord, ClaimTopic, ClaimVariant, ClaimWorkspace, CreateClaimEvidenceInput, CreateClaimInput, CreateClaimLineageInput, CreateClaimTopicInput, CreateClaimVariantInput, DemoPreparationInput, DemoResetInput, DemoScenario, DeviationDecisionInput, FirstObservedDeviation, GetInstitutionAnalyticsParams, HealthStatus, InstitutionAnalytics, InstitutionDetails, InstitutionInput, InstitutionMemberInput, InstitutionMembership, InstitutionOnboardingInput, InstitutionSettingsInput, InstitutionVerificationDecision, InstitutionVerificationQueueItem, LinkClaimObservationInput, ListFirstObservedDeviationsParams, ListInstitutionAuditEventsParams, ListReferenceObservationsParams, ListSemanticAnalysesParams, MonitorSource, MonitorSourceInput, ObservedContent, ObservedContentInput, OfficialReference, OfficialReferenceInput, PlanDefinition, PublicStatus, ReferenceObservation, ReferenceObservationInput, ResponseDraft, ResponseDraftInput, ReviewDecisionInput, ReviewStep, ReviewStepInput, SemanticActivationInput, SemanticAnalysis, SemanticAnalysisInput, SemanticCapabilities, SemanticProblem, SemanticResubmissionInput, SemanticReviewDecisionInput, SemanticReviewStep, SemanticReviewStepInput, TeamMember, TelegramLinkResult, TelegramReport, TelegramReportStatusInput, TelegramWebhookAck, TelegramWebhookUpdate, WorkspaceArchiveInput, WorkspaceArchiveResult, WorkspacePost, WorkspacePostInput, WorkspaceRecords, WorkspaceReference, WorkspaceReferenceInput } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getGetWorkspaceRecordsUrl: (institutionId: string) => string;
export declare const getWorkspaceRecords: (institutionId: string, options?: Parameters<typeof customFetch>[1]) => Promise<WorkspaceRecords>;
export declare const getGetWorkspaceRecordsQueryKey: (institutionId: string) => readonly [`/api/v1/institutions/${string}/workspace-records`];
export declare const getGetWorkspaceRecordsQueryOptions: <TData = Awaited<ReturnType<typeof getWorkspaceRecords>>, TError = ErrorType<void>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWorkspaceRecords>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWorkspaceRecords>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWorkspaceRecordsQueryResult = NonNullable<Awaited<ReturnType<typeof getWorkspaceRecords>>>;
export type GetWorkspaceRecordsQueryError = ErrorType<void>;
export declare function useGetWorkspaceRecords<TData = Awaited<ReturnType<typeof getWorkspaceRecords>>, TError = ErrorType<void>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWorkspaceRecords>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateWorkspaceReferenceUrl: (institutionId: string) => string;
export declare const createWorkspaceReference: (institutionId: string, workspaceReferenceInput: WorkspaceReferenceInput, options?: Parameters<typeof customFetch>[1]) => Promise<WorkspaceReference>;
export declare const getCreateWorkspaceReferenceMutationKey: () => readonly ["createWorkspaceReference"];
export declare const getCreateWorkspaceReferenceMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createWorkspaceReference>>, TError, CreateWorkspaceReferenceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createWorkspaceReference>>, TError, CreateWorkspaceReferenceMutationVariables, TContext>;
export type CreateWorkspaceReferenceMutationResult = NonNullable<Awaited<ReturnType<typeof createWorkspaceReference>>>;
export type CreateWorkspaceReferenceMutationBody = BodyType<WorkspaceReferenceInput>;
export type CreateWorkspaceReferenceMutationError = ErrorType<void>;
export type CreateWorkspaceReferenceMutationVariables = {
    institutionId: string;
    data: BodyType<WorkspaceReferenceInput>;
};
export declare const useCreateWorkspaceReference: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createWorkspaceReference>>, TError, CreateWorkspaceReferenceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createWorkspaceReference>>, TError, CreateWorkspaceReferenceMutationVariables, TContext>;
export declare const getUpdateWorkspaceReferenceUrl: (institutionId: string, referenceId: string) => string;
export declare const updateWorkspaceReference: (institutionId: string, referenceId: string, workspaceReferenceInput: WorkspaceReferenceInput, options?: Parameters<typeof customFetch>[1]) => Promise<WorkspaceReference>;
export declare const getUpdateWorkspaceReferenceMutationKey: () => readonly ["updateWorkspaceReference"];
export declare const getUpdateWorkspaceReferenceMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateWorkspaceReference>>, TError, UpdateWorkspaceReferenceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateWorkspaceReference>>, TError, UpdateWorkspaceReferenceMutationVariables, TContext>;
export type UpdateWorkspaceReferenceMutationResult = NonNullable<Awaited<ReturnType<typeof updateWorkspaceReference>>>;
export type UpdateWorkspaceReferenceMutationBody = BodyType<WorkspaceReferenceInput>;
export type UpdateWorkspaceReferenceMutationError = ErrorType<void>;
export type UpdateWorkspaceReferenceMutationVariables = {
    institutionId: string;
    referenceId: string;
    data: BodyType<WorkspaceReferenceInput>;
};
export declare const useUpdateWorkspaceReference: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateWorkspaceReference>>, TError, UpdateWorkspaceReferenceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateWorkspaceReference>>, TError, UpdateWorkspaceReferenceMutationVariables, TContext>;
export declare const getArchiveWorkspaceReferenceUrl: (institutionId: string, referenceId: string) => string;
export declare const archiveWorkspaceReference: (institutionId: string, referenceId: string, workspaceArchiveInput: WorkspaceArchiveInput, options?: Parameters<typeof customFetch>[1]) => Promise<WorkspaceArchiveResult>;
export declare const getArchiveWorkspaceReferenceMutationKey: () => readonly ["archiveWorkspaceReference"];
export declare const getArchiveWorkspaceReferenceMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof archiveWorkspaceReference>>, TError, ArchiveWorkspaceReferenceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof archiveWorkspaceReference>>, TError, ArchiveWorkspaceReferenceMutationVariables, TContext>;
export type ArchiveWorkspaceReferenceMutationResult = NonNullable<Awaited<ReturnType<typeof archiveWorkspaceReference>>>;
export type ArchiveWorkspaceReferenceMutationBody = BodyType<WorkspaceArchiveInput>;
export type ArchiveWorkspaceReferenceMutationError = ErrorType<void>;
export type ArchiveWorkspaceReferenceMutationVariables = {
    institutionId: string;
    referenceId: string;
    data: BodyType<WorkspaceArchiveInput>;
};
export declare const useArchiveWorkspaceReference: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof archiveWorkspaceReference>>, TError, ArchiveWorkspaceReferenceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof archiveWorkspaceReference>>, TError, ArchiveWorkspaceReferenceMutationVariables, TContext>;
export declare const getCreateWorkspacePostUrl: (institutionId: string) => string;
export declare const createWorkspacePost: (institutionId: string, workspacePostInput: WorkspacePostInput, options?: Parameters<typeof customFetch>[1]) => Promise<WorkspacePost>;
export declare const getCreateWorkspacePostMutationKey: () => readonly ["createWorkspacePost"];
export declare const getCreateWorkspacePostMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createWorkspacePost>>, TError, CreateWorkspacePostMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createWorkspacePost>>, TError, CreateWorkspacePostMutationVariables, TContext>;
export type CreateWorkspacePostMutationResult = NonNullable<Awaited<ReturnType<typeof createWorkspacePost>>>;
export type CreateWorkspacePostMutationBody = BodyType<WorkspacePostInput>;
export type CreateWorkspacePostMutationError = ErrorType<void>;
export type CreateWorkspacePostMutationVariables = {
    institutionId: string;
    data: BodyType<WorkspacePostInput>;
};
export declare const useCreateWorkspacePost: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createWorkspacePost>>, TError, CreateWorkspacePostMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createWorkspacePost>>, TError, CreateWorkspacePostMutationVariables, TContext>;
export declare const getUpdateWorkspacePostUrl: (institutionId: string, postId: string) => string;
export declare const updateWorkspacePost: (institutionId: string, postId: string, workspacePostInput: WorkspacePostInput, options?: Parameters<typeof customFetch>[1]) => Promise<WorkspacePost>;
export declare const getUpdateWorkspacePostMutationKey: () => readonly ["updateWorkspacePost"];
export declare const getUpdateWorkspacePostMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateWorkspacePost>>, TError, UpdateWorkspacePostMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateWorkspacePost>>, TError, UpdateWorkspacePostMutationVariables, TContext>;
export type UpdateWorkspacePostMutationResult = NonNullable<Awaited<ReturnType<typeof updateWorkspacePost>>>;
export type UpdateWorkspacePostMutationBody = BodyType<WorkspacePostInput>;
export type UpdateWorkspacePostMutationError = ErrorType<void>;
export type UpdateWorkspacePostMutationVariables = {
    institutionId: string;
    postId: string;
    data: BodyType<WorkspacePostInput>;
};
export declare const useUpdateWorkspacePost: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateWorkspacePost>>, TError, UpdateWorkspacePostMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateWorkspacePost>>, TError, UpdateWorkspacePostMutationVariables, TContext>;
export declare const getArchiveWorkspacePostUrl: (institutionId: string, postId: string) => string;
export declare const archiveWorkspacePost: (institutionId: string, postId: string, workspaceArchiveInput: WorkspaceArchiveInput, options?: Parameters<typeof customFetch>[1]) => Promise<WorkspaceArchiveResult>;
export declare const getArchiveWorkspacePostMutationKey: () => readonly ["archiveWorkspacePost"];
export declare const getArchiveWorkspacePostMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof archiveWorkspacePost>>, TError, ArchiveWorkspacePostMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof archiveWorkspacePost>>, TError, ArchiveWorkspacePostMutationVariables, TContext>;
export type ArchiveWorkspacePostMutationResult = NonNullable<Awaited<ReturnType<typeof archiveWorkspacePost>>>;
export type ArchiveWorkspacePostMutationBody = BodyType<WorkspaceArchiveInput>;
export type ArchiveWorkspacePostMutationError = ErrorType<void>;
export type ArchiveWorkspacePostMutationVariables = {
    institutionId: string;
    postId: string;
    data: BodyType<WorkspaceArchiveInput>;
};
export declare const useArchiveWorkspacePost: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof archiveWorkspacePost>>, TError, ArchiveWorkspacePostMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof archiveWorkspacePost>>, TError, ArchiveWorkspacePostMutationVariables, TContext>;
export declare const getUpdateSemanticActivationUrl: (institutionId: string) => string;
export declare const updateSemanticActivation: (institutionId: string, semanticActivationInput: SemanticActivationInput, options?: Parameters<typeof customFetch>[1]) => Promise<SemanticCapabilities>;
export declare const getUpdateSemanticActivationMutationKey: () => readonly ["updateSemanticActivation"];
export declare const getUpdateSemanticActivationMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSemanticActivation>>, TError, UpdateSemanticActivationMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSemanticActivation>>, TError, UpdateSemanticActivationMutationVariables, TContext>;
export type UpdateSemanticActivationMutationResult = NonNullable<Awaited<ReturnType<typeof updateSemanticActivation>>>;
export type UpdateSemanticActivationMutationBody = BodyType<SemanticActivationInput>;
export type UpdateSemanticActivationMutationError = ErrorType<void>;
export type UpdateSemanticActivationMutationVariables = {
    institutionId: string;
    data: BodyType<SemanticActivationInput>;
};
export declare const useUpdateSemanticActivation: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSemanticActivation>>, TError, UpdateSemanticActivationMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSemanticActivation>>, TError, UpdateSemanticActivationMutationVariables, TContext>;
export declare const getGetTelegramLinkUrl: (institutionId: string) => string;
export declare const getTelegramLink: (institutionId: string, options?: Parameters<typeof customFetch>[1]) => Promise<TelegramLinkResult>;
export declare const getGetTelegramLinkQueryKey: (institutionId: string) => readonly [`/api/v1/institutions/${string}/telegram/link`];
export declare const getGetTelegramLinkQueryOptions: <TData = Awaited<ReturnType<typeof getTelegramLink>>, TError = ErrorType<unknown>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTelegramLink>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTelegramLink>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTelegramLinkQueryResult = NonNullable<Awaited<ReturnType<typeof getTelegramLink>>>;
export type GetTelegramLinkQueryError = ErrorType<unknown>;
export declare function useGetTelegramLink<TData = Awaited<ReturnType<typeof getTelegramLink>>, TError = ErrorType<unknown>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTelegramLink>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRotateTelegramLinkUrl: (institutionId: string) => string;
export declare const rotateTelegramLink: (institutionId: string, options?: Parameters<typeof customFetch>[1]) => Promise<TelegramLinkResult>;
export declare const getRotateTelegramLinkMutationKey: () => readonly ["rotateTelegramLink"];
export declare const getRotateTelegramLinkMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rotateTelegramLink>>, TError, RotateTelegramLinkMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof rotateTelegramLink>>, TError, RotateTelegramLinkMutationVariables, TContext>;
export type RotateTelegramLinkMutationResult = NonNullable<Awaited<ReturnType<typeof rotateTelegramLink>>>;
export type RotateTelegramLinkMutationError = ErrorType<unknown>;
export type RotateTelegramLinkMutationVariables = {
    institutionId: string;
};
export declare const useRotateTelegramLink: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rotateTelegramLink>>, TError, RotateTelegramLinkMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof rotateTelegramLink>>, TError, RotateTelegramLinkMutationVariables, TContext>;
export declare const getRevokeTelegramLinkUrl: (institutionId: string) => string;
export declare const revokeTelegramLink: (institutionId: string, options?: Parameters<typeof customFetch>[1]) => Promise<TelegramLinkResult>;
export declare const getRevokeTelegramLinkMutationKey: () => readonly ["revokeTelegramLink"];
export declare const getRevokeTelegramLinkMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof revokeTelegramLink>>, TError, RevokeTelegramLinkMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof revokeTelegramLink>>, TError, RevokeTelegramLinkMutationVariables, TContext>;
export type RevokeTelegramLinkMutationResult = NonNullable<Awaited<ReturnType<typeof revokeTelegramLink>>>;
export type RevokeTelegramLinkMutationError = ErrorType<unknown>;
export type RevokeTelegramLinkMutationVariables = {
    institutionId: string;
};
export declare const useRevokeTelegramLink: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof revokeTelegramLink>>, TError, RevokeTelegramLinkMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof revokeTelegramLink>>, TError, RevokeTelegramLinkMutationVariables, TContext>;
export declare const getListTelegramReportsUrl: (institutionId: string) => string;
export declare const listTelegramReports: (institutionId: string, options?: Parameters<typeof customFetch>[1]) => Promise<TelegramReport[]>;
export declare const getListTelegramReportsQueryKey: (institutionId: string) => readonly [`/api/v1/institutions/${string}/telegram/reports`];
export declare const getListTelegramReportsQueryOptions: <TData = Awaited<ReturnType<typeof listTelegramReports>>, TError = ErrorType<unknown>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTelegramReports>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTelegramReports>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTelegramReportsQueryResult = NonNullable<Awaited<ReturnType<typeof listTelegramReports>>>;
export type ListTelegramReportsQueryError = ErrorType<unknown>;
export declare function useListTelegramReports<TData = Awaited<ReturnType<typeof listTelegramReports>>, TError = ErrorType<unknown>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTelegramReports>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateTelegramReportStatusUrl: (institutionId: string, reportId: string) => string;
export declare const updateTelegramReportStatus: (institutionId: string, reportId: string, telegramReportStatusInput: TelegramReportStatusInput, options?: Parameters<typeof customFetch>[1]) => Promise<TelegramReport>;
export declare const getUpdateTelegramReportStatusMutationKey: () => readonly ["updateTelegramReportStatus"];
export declare const getUpdateTelegramReportStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTelegramReportStatus>>, TError, UpdateTelegramReportStatusMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateTelegramReportStatus>>, TError, UpdateTelegramReportStatusMutationVariables, TContext>;
export type UpdateTelegramReportStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateTelegramReportStatus>>>;
export type UpdateTelegramReportStatusMutationBody = BodyType<TelegramReportStatusInput>;
export type UpdateTelegramReportStatusMutationError = ErrorType<unknown>;
export type UpdateTelegramReportStatusMutationVariables = {
    institutionId: string;
    reportId: string;
    data: BodyType<TelegramReportStatusInput>;
};
export declare const useUpdateTelegramReportStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTelegramReportStatus>>, TError, UpdateTelegramReportStatusMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateTelegramReportStatus>>, TError, UpdateTelegramReportStatusMutationVariables, TContext>;
export declare const getReceiveTelegramWebhookUrl: () => string;
export declare const receiveTelegramWebhook: (telegramWebhookUpdate: TelegramWebhookUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<TelegramWebhookAck>;
export declare const getReceiveTelegramWebhookMutationKey: () => readonly ["receiveTelegramWebhook"];
export declare const getReceiveTelegramWebhookMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof receiveTelegramWebhook>>, TError, ReceiveTelegramWebhookMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof receiveTelegramWebhook>>, TError, ReceiveTelegramWebhookMutationVariables, TContext>;
export type ReceiveTelegramWebhookMutationResult = NonNullable<Awaited<ReturnType<typeof receiveTelegramWebhook>>>;
export type ReceiveTelegramWebhookMutationBody = BodyType<TelegramWebhookUpdate>;
export type ReceiveTelegramWebhookMutationError = ErrorType<void>;
export type ReceiveTelegramWebhookMutationVariables = {
    data: BodyType<TelegramWebhookUpdate>;
};
export declare const useReceiveTelegramWebhook: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof receiveTelegramWebhook>>, TError, ReceiveTelegramWebhookMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof receiveTelegramWebhook>>, TError, ReceiveTelegramWebhookMutationVariables, TContext>;
export declare const getGetSemanticCapabilitiesUrl: (institutionId: string) => string;
/**
 * Any institution member. Read-only; no provider secrets returned.
 */
export declare const getSemanticCapabilities: (institutionId: string, options?: Parameters<typeof customFetch>[1]) => Promise<SemanticCapabilities>;
export declare const getGetSemanticCapabilitiesQueryKey: (institutionId: string) => readonly [`/api/v1/institutions/${string}/semantic-capabilities`];
export declare const getGetSemanticCapabilitiesQueryOptions: <TData = Awaited<ReturnType<typeof getSemanticCapabilities>>, TError = ErrorType<SemanticProblem>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSemanticCapabilities>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSemanticCapabilities>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSemanticCapabilitiesQueryResult = NonNullable<Awaited<ReturnType<typeof getSemanticCapabilities>>>;
export type GetSemanticCapabilitiesQueryError = ErrorType<SemanticProblem>;
export declare function useGetSemanticCapabilities<TData = Awaited<ReturnType<typeof getSemanticCapabilities>>, TError = ErrorType<SemanticProblem>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSemanticCapabilities>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListReferenceObservationsUrl: (institutionId: string, params?: ListReferenceObservationsParams) => string;
/**
 * Any member; scoped to this institution only.
 */
export declare const listReferenceObservations: (institutionId: string, params?: ListReferenceObservationsParams, options?: Parameters<typeof customFetch>[1]) => Promise<ReferenceObservation[]>;
export declare const getListReferenceObservationsQueryKey: (institutionId: string, params?: ListReferenceObservationsParams) => readonly [`/api/v1/institutions/${string}/reference-observations`, ...ListReferenceObservationsParams[]];
export declare const getListReferenceObservationsQueryOptions: <TData = Awaited<ReturnType<typeof listReferenceObservations>>, TError = ErrorType<SemanticProblem>>(institutionId: string, params?: ListReferenceObservationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listReferenceObservations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listReferenceObservations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListReferenceObservationsQueryResult = NonNullable<Awaited<ReturnType<typeof listReferenceObservations>>>;
export type ListReferenceObservationsQueryError = ErrorType<SemanticProblem>;
export declare function useListReferenceObservations<TData = Awaited<ReturnType<typeof listReferenceObservations>>, TError = ErrorType<SemanticProblem>>(institutionId: string, params?: ListReferenceObservationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listReferenceObservations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateReferenceObservationUrl: (institutionId: string) => string;
/**
 * tenant_admin or analyst; feature flag required. Server derives actor and dataset scope.
 */
export declare const createReferenceObservation: (institutionId: string, referenceObservationInput: ReferenceObservationInput, options?: Parameters<typeof customFetch>[1]) => Promise<ReferenceObservation>;
export declare const getCreateReferenceObservationMutationKey: () => readonly ["createReferenceObservation"];
export declare const getCreateReferenceObservationMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createReferenceObservation>>, TError, CreateReferenceObservationMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createReferenceObservation>>, TError, CreateReferenceObservationMutationVariables, TContext>;
export type CreateReferenceObservationMutationResult = NonNullable<Awaited<ReturnType<typeof createReferenceObservation>>>;
export type CreateReferenceObservationMutationBody = BodyType<ReferenceObservationInput>;
export type CreateReferenceObservationMutationError = ErrorType<SemanticProblem>;
export type CreateReferenceObservationMutationVariables = {
    institutionId: string;
    data: BodyType<ReferenceObservationInput>;
};
export declare const useCreateReferenceObservation: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createReferenceObservation>>, TError, CreateReferenceObservationMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createReferenceObservation>>, TError, CreateReferenceObservationMutationVariables, TContext>;
export declare const getListSemanticAnalysesUrl: (institutionId: string, params?: ListSemanticAnalysesParams) => string;
export declare const listSemanticAnalyses: (institutionId: string, params?: ListSemanticAnalysesParams, options?: Parameters<typeof customFetch>[1]) => Promise<SemanticAnalysis[]>;
export declare const getListSemanticAnalysesQueryKey: (institutionId: string, params?: ListSemanticAnalysesParams) => readonly [`/api/v1/institutions/${string}/semantic-analyses`, ...ListSemanticAnalysesParams[]];
export declare const getListSemanticAnalysesQueryOptions: <TData = Awaited<ReturnType<typeof listSemanticAnalyses>>, TError = ErrorType<SemanticProblem>>(institutionId: string, params?: ListSemanticAnalysesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSemanticAnalyses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSemanticAnalyses>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSemanticAnalysesQueryResult = NonNullable<Awaited<ReturnType<typeof listSemanticAnalyses>>>;
export type ListSemanticAnalysesQueryError = ErrorType<SemanticProblem>;
export declare function useListSemanticAnalyses<TData = Awaited<ReturnType<typeof listSemanticAnalyses>>, TError = ErrorType<SemanticProblem>>(institutionId: string, params?: ListSemanticAnalysesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSemanticAnalyses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateSemanticAnalysisUrl: (institutionId: string) => string;
/**
 * tenant_admin or analyst; flag required. Server takes exact snapshots, computes hash and selects engine version. Identical input returns the existing record, never overwrites it. No external provider call inside the transaction.
 */
export declare const createSemanticAnalysis: (institutionId: string, semanticAnalysisInput: SemanticAnalysisInput, options?: Parameters<typeof customFetch>[1]) => Promise<SemanticAnalysis>;
export declare const getCreateSemanticAnalysisMutationKey: () => readonly ["createSemanticAnalysis"];
export declare const getCreateSemanticAnalysisMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSemanticAnalysis>>, TError, CreateSemanticAnalysisMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createSemanticAnalysis>>, TError, CreateSemanticAnalysisMutationVariables, TContext>;
export type CreateSemanticAnalysisMutationResult = NonNullable<Awaited<ReturnType<typeof createSemanticAnalysis>>>;
export type CreateSemanticAnalysisMutationBody = BodyType<SemanticAnalysisInput>;
export type CreateSemanticAnalysisMutationError = ErrorType<SemanticProblem>;
export type CreateSemanticAnalysisMutationVariables = {
    institutionId: string;
    data: BodyType<SemanticAnalysisInput>;
};
export declare const useCreateSemanticAnalysis: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSemanticAnalysis>>, TError, CreateSemanticAnalysisMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createSemanticAnalysis>>, TError, CreateSemanticAnalysisMutationVariables, TContext>;
export declare const getGetSemanticAnalysisUrl: (institutionId: string, analysisId: string) => string;
export declare const getSemanticAnalysis: (institutionId: string, analysisId: string, options?: Parameters<typeof customFetch>[1]) => Promise<SemanticAnalysis>;
export declare const getGetSemanticAnalysisQueryKey: (institutionId: string, analysisId: string) => readonly [`/api/v1/institutions/${string}/semantic-analyses/${string}`];
export declare const getGetSemanticAnalysisQueryOptions: <TData = Awaited<ReturnType<typeof getSemanticAnalysis>>, TError = ErrorType<SemanticProblem>>(institutionId: string, analysisId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSemanticAnalysis>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSemanticAnalysis>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSemanticAnalysisQueryResult = NonNullable<Awaited<ReturnType<typeof getSemanticAnalysis>>>;
export type GetSemanticAnalysisQueryError = ErrorType<SemanticProblem>;
export declare function useGetSemanticAnalysis<TData = Awaited<ReturnType<typeof getSemanticAnalysis>>, TError = ErrorType<SemanticProblem>>(institutionId: string, analysisId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSemanticAnalysis>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRetrySemanticAnalysisUrl: (institutionId: string, analysisId: string) => string;
/**
 * tenant_admin or analyst; flag required. Only failed jobs; retains immutable inputs and record ID.
 */
export declare const retrySemanticAnalysis: (institutionId: string, analysisId: string, options?: Parameters<typeof customFetch>[1]) => Promise<SemanticAnalysis>;
export declare const getRetrySemanticAnalysisMutationKey: () => readonly ["retrySemanticAnalysis"];
export declare const getRetrySemanticAnalysisMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof retrySemanticAnalysis>>, TError, RetrySemanticAnalysisMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof retrySemanticAnalysis>>, TError, RetrySemanticAnalysisMutationVariables, TContext>;
export type RetrySemanticAnalysisMutationResult = NonNullable<Awaited<ReturnType<typeof retrySemanticAnalysis>>>;
export type RetrySemanticAnalysisMutationError = ErrorType<SemanticProblem>;
export type RetrySemanticAnalysisMutationVariables = {
    institutionId: string;
    analysisId: string;
};
export declare const useRetrySemanticAnalysis: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof retrySemanticAnalysis>>, TError, RetrySemanticAnalysisMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof retrySemanticAnalysis>>, TError, RetrySemanticAnalysisMutationVariables, TContext>;
export declare const getCreateSemanticReviewStepUrl: (institutionId: string, analysisId: string) => string;
/**
 * tenant_admin; flag required. Case must match the analysis pair. Eligible reviewer/administrator must not be requestedBy. Uses marjea_review_steps, not an independent review engine.
 */
export declare const createSemanticReviewStep: (institutionId: string, analysisId: string, semanticReviewStepInput: SemanticReviewStepInput, options?: Parameters<typeof customFetch>[1]) => Promise<SemanticReviewStep>;
export declare const getCreateSemanticReviewStepMutationKey: () => readonly ["createSemanticReviewStep"];
export declare const getCreateSemanticReviewStepMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSemanticReviewStep>>, TError, CreateSemanticReviewStepMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createSemanticReviewStep>>, TError, CreateSemanticReviewStepMutationVariables, TContext>;
export type CreateSemanticReviewStepMutationResult = NonNullable<Awaited<ReturnType<typeof createSemanticReviewStep>>>;
export type CreateSemanticReviewStepMutationBody = BodyType<SemanticReviewStepInput>;
export type CreateSemanticReviewStepMutationError = ErrorType<SemanticProblem>;
export type CreateSemanticReviewStepMutationVariables = {
    institutionId: string;
    analysisId: string;
    data: BodyType<SemanticReviewStepInput>;
};
export declare const useCreateSemanticReviewStep: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createSemanticReviewStep>>, TError, CreateSemanticReviewStepMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createSemanticReviewStep>>, TError, CreateSemanticReviewStepMutationVariables, TContext>;
export declare const getSubmitSemanticReviewDecisionUrl: (institutionId: string, analysisId: string, stepId: string) => string;
/**
 * Assigned reviewer or assigned tenant_admin; flag required and requester self-review prohibited. Atomic step decision and analysis status update. Never approves a response draft or closes a case.
 */
export declare const submitSemanticReviewDecision: (institutionId: string, analysisId: string, stepId: string, semanticReviewDecisionInput: SemanticReviewDecisionInput, options?: Parameters<typeof customFetch>[1]) => Promise<SemanticReviewStep>;
export declare const getSubmitSemanticReviewDecisionMutationKey: () => readonly ["submitSemanticReviewDecision"];
export declare const getSubmitSemanticReviewDecisionMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitSemanticReviewDecision>>, TError, SubmitSemanticReviewDecisionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof submitSemanticReviewDecision>>, TError, SubmitSemanticReviewDecisionMutationVariables, TContext>;
export type SubmitSemanticReviewDecisionMutationResult = NonNullable<Awaited<ReturnType<typeof submitSemanticReviewDecision>>>;
export type SubmitSemanticReviewDecisionMutationBody = BodyType<SemanticReviewDecisionInput>;
export type SubmitSemanticReviewDecisionMutationError = ErrorType<SemanticProblem>;
export type SubmitSemanticReviewDecisionMutationVariables = {
    institutionId: string;
    analysisId: string;
    stepId: string;
    data: BodyType<SemanticReviewDecisionInput>;
};
export declare const useSubmitSemanticReviewDecision: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitSemanticReviewDecision>>, TError, SubmitSemanticReviewDecisionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof submitSemanticReviewDecision>>, TError, SubmitSemanticReviewDecisionMutationVariables, TContext>;
export declare const getResubmitSemanticAnalysisUrl: (institutionId: string, analysisId: string) => string;
/**
 * tenant_admin or analyst; flag required. Revision-requested only; new review round preserving earlier decisions and machine result.
 */
export declare const resubmitSemanticAnalysis: (institutionId: string, analysisId: string, semanticResubmissionInput: SemanticResubmissionInput, options?: Parameters<typeof customFetch>[1]) => Promise<SemanticAnalysis>;
export declare const getResubmitSemanticAnalysisMutationKey: () => readonly ["resubmitSemanticAnalysis"];
export declare const getResubmitSemanticAnalysisMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resubmitSemanticAnalysis>>, TError, ResubmitSemanticAnalysisMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof resubmitSemanticAnalysis>>, TError, ResubmitSemanticAnalysisMutationVariables, TContext>;
export type ResubmitSemanticAnalysisMutationResult = NonNullable<Awaited<ReturnType<typeof resubmitSemanticAnalysis>>>;
export type ResubmitSemanticAnalysisMutationBody = BodyType<SemanticResubmissionInput>;
export type ResubmitSemanticAnalysisMutationError = ErrorType<SemanticProblem>;
export type ResubmitSemanticAnalysisMutationVariables = {
    institutionId: string;
    analysisId: string;
    data: BodyType<SemanticResubmissionInput>;
};
export declare const useResubmitSemanticAnalysis: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resubmitSemanticAnalysis>>, TError, ResubmitSemanticAnalysisMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof resubmitSemanticAnalysis>>, TError, ResubmitSemanticAnalysisMutationVariables, TContext>;
export declare const getListFirstObservedDeviationsUrl: (institutionId: string, params?: ListFirstObservedDeviationsParams) => string;
/**
 * Any member. Never claims first on the internet.
 */
export declare const listFirstObservedDeviations: (institutionId: string, params?: ListFirstObservedDeviationsParams, options?: Parameters<typeof customFetch>[1]) => Promise<FirstObservedDeviation[]>;
export declare const getListFirstObservedDeviationsQueryKey: (institutionId: string, params?: ListFirstObservedDeviationsParams) => readonly [`/api/v1/institutions/${string}/first-observed-deviations`, ...ListFirstObservedDeviationsParams[]];
export declare const getListFirstObservedDeviationsQueryOptions: <TData = Awaited<ReturnType<typeof listFirstObservedDeviations>>, TError = ErrorType<SemanticProblem>>(institutionId: string, params?: ListFirstObservedDeviationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFirstObservedDeviations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listFirstObservedDeviations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListFirstObservedDeviationsQueryResult = NonNullable<Awaited<ReturnType<typeof listFirstObservedDeviations>>>;
export type ListFirstObservedDeviationsQueryError = ErrorType<SemanticProblem>;
export declare function useListFirstObservedDeviations<TData = Awaited<ReturnType<typeof listFirstObservedDeviations>>, TError = ErrorType<SemanticProblem>>(institutionId: string, params?: ListFirstObservedDeviationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listFirstObservedDeviations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getConfirmFirstObservedDeviationUrl: (institutionId: string, candidateId: string) => string;
/**
 * tenant_admin or reviewer; flag required. Human confirmation after locking and revalidating all older eligible observations for this reference version/dataset/engine. Unresolved, failed or stale older analyses block.
 */
export declare const confirmFirstObservedDeviation: (institutionId: string, candidateId: string, deviationDecisionInput: DeviationDecisionInput, options?: Parameters<typeof customFetch>[1]) => Promise<FirstObservedDeviation>;
export declare const getConfirmFirstObservedDeviationMutationKey: () => readonly ["confirmFirstObservedDeviation"];
export declare const getConfirmFirstObservedDeviationMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof confirmFirstObservedDeviation>>, TError, ConfirmFirstObservedDeviationMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof confirmFirstObservedDeviation>>, TError, ConfirmFirstObservedDeviationMutationVariables, TContext>;
export type ConfirmFirstObservedDeviationMutationResult = NonNullable<Awaited<ReturnType<typeof confirmFirstObservedDeviation>>>;
export type ConfirmFirstObservedDeviationMutationBody = BodyType<DeviationDecisionInput>;
export type ConfirmFirstObservedDeviationMutationError = ErrorType<SemanticProblem>;
export type ConfirmFirstObservedDeviationMutationVariables = {
    institutionId: string;
    candidateId: string;
    data: BodyType<DeviationDecisionInput>;
};
export declare const useConfirmFirstObservedDeviation: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof confirmFirstObservedDeviation>>, TError, ConfirmFirstObservedDeviationMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof confirmFirstObservedDeviation>>, TError, ConfirmFirstObservedDeviationMutationVariables, TContext>;
export declare const getRejectFirstObservedDeviationUrl: (institutionId: string, candidateId: string) => string;
/**
 * tenant_admin or reviewer; flag required. Rejection is not proof that an older observation has no deviation.
 */
export declare const rejectFirstObservedDeviation: (institutionId: string, candidateId: string, deviationDecisionInput: DeviationDecisionInput, options?: Parameters<typeof customFetch>[1]) => Promise<FirstObservedDeviation>;
export declare const getRejectFirstObservedDeviationMutationKey: () => readonly ["rejectFirstObservedDeviation"];
export declare const getRejectFirstObservedDeviationMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rejectFirstObservedDeviation>>, TError, RejectFirstObservedDeviationMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof rejectFirstObservedDeviation>>, TError, RejectFirstObservedDeviationMutationVariables, TContext>;
export type RejectFirstObservedDeviationMutationResult = NonNullable<Awaited<ReturnType<typeof rejectFirstObservedDeviation>>>;
export type RejectFirstObservedDeviationMutationBody = BodyType<DeviationDecisionInput>;
export type RejectFirstObservedDeviationMutationError = ErrorType<SemanticProblem>;
export type RejectFirstObservedDeviationMutationVariables = {
    institutionId: string;
    candidateId: string;
    data: BodyType<DeviationDecisionInput>;
};
export declare const useRejectFirstObservedDeviation: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rejectFirstObservedDeviation>>, TError, RejectFirstObservedDeviationMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof rejectFirstObservedDeviation>>, TError, RejectFirstObservedDeviationMutationVariables, TContext>;
export declare const getGetClaimWorkspaceUrl: (institutionId: string) => string;
/**
 * Institution-scoped claim topics, records, variants, observed links, and evidence lineage. Chronology and similarity are not proof of propagation.
 */
export declare const getClaimWorkspace: (institutionId: string, options?: Parameters<typeof customFetch>[1]) => Promise<ClaimWorkspace>;
export declare const getGetClaimWorkspaceQueryKey: (institutionId: string) => readonly [`/api/v1/institutions/${string}/claim-workspace`];
export declare const getGetClaimWorkspaceQueryOptions: <TData = Awaited<ReturnType<typeof getClaimWorkspace>>, TError = ErrorType<SemanticProblem>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getClaimWorkspace>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getClaimWorkspace>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetClaimWorkspaceQueryResult = NonNullable<Awaited<ReturnType<typeof getClaimWorkspace>>>;
export type GetClaimWorkspaceQueryError = ErrorType<SemanticProblem>;
export declare function useGetClaimWorkspace<TData = Awaited<ReturnType<typeof getClaimWorkspace>>, TError = ErrorType<SemanticProblem>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getClaimWorkspace>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListInstitutionAuditEventsUrl: (institutionId: string, params?: ListInstitutionAuditEventsParams) => string;
/**
 * Read-only committed audit events for tenant_admin and auditor members. Raw metadata, reasons and content are never returned.
 */
export declare const listInstitutionAuditEvents: (institutionId: string, params?: ListInstitutionAuditEventsParams, options?: Parameters<typeof customFetch>[1]) => Promise<AuditEventsPage>;
export declare const getListInstitutionAuditEventsQueryKey: (institutionId: string, params?: ListInstitutionAuditEventsParams) => readonly [`/api/v1/institutions/${string}/audit-events`, ...ListInstitutionAuditEventsParams[]];
export declare const getListInstitutionAuditEventsQueryOptions: <TData = Awaited<ReturnType<typeof listInstitutionAuditEvents>>, TError = ErrorType<SemanticProblem>>(institutionId: string, params?: ListInstitutionAuditEventsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listInstitutionAuditEvents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listInstitutionAuditEvents>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListInstitutionAuditEventsQueryResult = NonNullable<Awaited<ReturnType<typeof listInstitutionAuditEvents>>>;
export type ListInstitutionAuditEventsQueryError = ErrorType<SemanticProblem>;
export declare function useListInstitutionAuditEvents<TData = Awaited<ReturnType<typeof listInstitutionAuditEvents>>, TError = ErrorType<SemanticProblem>>(institutionId: string, params?: ListInstitutionAuditEventsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listInstitutionAuditEvents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetInstitutionAnalyticsUrl: (institutionId: string, params: GetInstitutionAnalyticsParams) => string;
/**
 * Tenant-admin and auditor read-only aggregate report; excludes demo records and never returns source content.
 */
export declare const getInstitutionAnalytics: (institutionId: string, params: GetInstitutionAnalyticsParams, options?: Parameters<typeof customFetch>[1]) => Promise<InstitutionAnalytics>;
export declare const getGetInstitutionAnalyticsQueryKey: (institutionId: string, params?: GetInstitutionAnalyticsParams) => readonly [`/api/v1/institutions/${string}/analytics`, ...GetInstitutionAnalyticsParams[]];
export declare const getGetInstitutionAnalyticsQueryOptions: <TData = Awaited<ReturnType<typeof getInstitutionAnalytics>>, TError = ErrorType<SemanticProblem>>(institutionId: string, params: GetInstitutionAnalyticsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInstitutionAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getInstitutionAnalytics>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetInstitutionAnalyticsQueryResult = NonNullable<Awaited<ReturnType<typeof getInstitutionAnalytics>>>;
export type GetInstitutionAnalyticsQueryError = ErrorType<SemanticProblem>;
export declare function useGetInstitutionAnalytics<TData = Awaited<ReturnType<typeof getInstitutionAnalytics>>, TError = ErrorType<SemanticProblem>>(institutionId: string, params: GetInstitutionAnalyticsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInstitutionAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateClaimTopicUrl: (institutionId: string) => string;
export declare const createClaimTopic: (institutionId: string, createClaimTopicInput: CreateClaimTopicInput, options?: Parameters<typeof customFetch>[1]) => Promise<ClaimTopic>;
export declare const getCreateClaimTopicMutationKey: () => readonly ["createClaimTopic"];
export declare const getCreateClaimTopicMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClaimTopic>>, TError, CreateClaimTopicMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createClaimTopic>>, TError, CreateClaimTopicMutationVariables, TContext>;
export type CreateClaimTopicMutationResult = NonNullable<Awaited<ReturnType<typeof createClaimTopic>>>;
export type CreateClaimTopicMutationBody = BodyType<CreateClaimTopicInput>;
export type CreateClaimTopicMutationError = ErrorType<SemanticProblem>;
export type CreateClaimTopicMutationVariables = {
    institutionId: string;
    data: BodyType<CreateClaimTopicInput>;
};
export declare const useCreateClaimTopic: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClaimTopic>>, TError, CreateClaimTopicMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createClaimTopic>>, TError, CreateClaimTopicMutationVariables, TContext>;
export declare const getCreateClaimUrl: (institutionId: string) => string;
export declare const createClaim: (institutionId: string, createClaimInput: CreateClaimInput, options?: Parameters<typeof customFetch>[1]) => Promise<ClaimRecord>;
export declare const getCreateClaimMutationKey: () => readonly ["createClaim"];
export declare const getCreateClaimMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClaim>>, TError, CreateClaimMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createClaim>>, TError, CreateClaimMutationVariables, TContext>;
export type CreateClaimMutationResult = NonNullable<Awaited<ReturnType<typeof createClaim>>>;
export type CreateClaimMutationBody = BodyType<CreateClaimInput>;
export type CreateClaimMutationError = ErrorType<SemanticProblem>;
export type CreateClaimMutationVariables = {
    institutionId: string;
    data: BodyType<CreateClaimInput>;
};
export declare const useCreateClaim: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClaim>>, TError, CreateClaimMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createClaim>>, TError, CreateClaimMutationVariables, TContext>;
export declare const getCreateClaimVariantUrl: (institutionId: string, claimId: string) => string;
export declare const createClaimVariant: (institutionId: string, claimId: string, createClaimVariantInput: CreateClaimVariantInput, options?: Parameters<typeof customFetch>[1]) => Promise<ClaimVariant>;
export declare const getCreateClaimVariantMutationKey: () => readonly ["createClaimVariant"];
export declare const getCreateClaimVariantMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClaimVariant>>, TError, CreateClaimVariantMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createClaimVariant>>, TError, CreateClaimVariantMutationVariables, TContext>;
export type CreateClaimVariantMutationResult = NonNullable<Awaited<ReturnType<typeof createClaimVariant>>>;
export type CreateClaimVariantMutationBody = BodyType<CreateClaimVariantInput>;
export type CreateClaimVariantMutationError = ErrorType<SemanticProblem>;
export type CreateClaimVariantMutationVariables = {
    institutionId: string;
    claimId: string;
    data: BodyType<CreateClaimVariantInput>;
};
export declare const useCreateClaimVariant: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClaimVariant>>, TError, CreateClaimVariantMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createClaimVariant>>, TError, CreateClaimVariantMutationVariables, TContext>;
export declare const getLinkClaimObservationUrl: (institutionId: string) => string;
export declare const linkClaimObservation: (institutionId: string, linkClaimObservationInput: LinkClaimObservationInput, options?: Parameters<typeof customFetch>[1]) => Promise<ClaimObservation>;
export declare const getLinkClaimObservationMutationKey: () => readonly ["linkClaimObservation"];
export declare const getLinkClaimObservationMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof linkClaimObservation>>, TError, LinkClaimObservationMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof linkClaimObservation>>, TError, LinkClaimObservationMutationVariables, TContext>;
export type LinkClaimObservationMutationResult = NonNullable<Awaited<ReturnType<typeof linkClaimObservation>>>;
export type LinkClaimObservationMutationBody = BodyType<LinkClaimObservationInput>;
export type LinkClaimObservationMutationError = ErrorType<SemanticProblem>;
export type LinkClaimObservationMutationVariables = {
    institutionId: string;
    data: BodyType<LinkClaimObservationInput>;
};
export declare const useLinkClaimObservation: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof linkClaimObservation>>, TError, LinkClaimObservationMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof linkClaimObservation>>, TError, LinkClaimObservationMutationVariables, TContext>;
export declare const getCreateClaimLineageUrl: (institutionId: string) => string;
export declare const createClaimLineage: (institutionId: string, createClaimLineageInput: CreateClaimLineageInput, options?: Parameters<typeof customFetch>[1]) => Promise<ClaimLineage>;
export declare const getCreateClaimLineageMutationKey: () => readonly ["createClaimLineage"];
export declare const getCreateClaimLineageMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClaimLineage>>, TError, CreateClaimLineageMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createClaimLineage>>, TError, CreateClaimLineageMutationVariables, TContext>;
export type CreateClaimLineageMutationResult = NonNullable<Awaited<ReturnType<typeof createClaimLineage>>>;
export type CreateClaimLineageMutationBody = BodyType<CreateClaimLineageInput>;
export type CreateClaimLineageMutationError = ErrorType<SemanticProblem>;
export type CreateClaimLineageMutationVariables = {
    institutionId: string;
    data: BodyType<CreateClaimLineageInput>;
};
export declare const useCreateClaimLineage: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClaimLineage>>, TError, CreateClaimLineageMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createClaimLineage>>, TError, CreateClaimLineageMutationVariables, TContext>;
export declare const getCreateClaimEvidenceUrl: (institutionId: string) => string;
export declare const createClaimEvidence: (institutionId: string, createClaimEvidenceInput: CreateClaimEvidenceInput, options?: Parameters<typeof customFetch>[1]) => Promise<ClaimEvidence>;
export declare const getCreateClaimEvidenceMutationKey: () => readonly ["createClaimEvidence"];
export declare const getCreateClaimEvidenceMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClaimEvidence>>, TError, CreateClaimEvidenceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createClaimEvidence>>, TError, CreateClaimEvidenceMutationVariables, TContext>;
export type CreateClaimEvidenceMutationResult = NonNullable<Awaited<ReturnType<typeof createClaimEvidence>>>;
export type CreateClaimEvidenceMutationBody = BodyType<CreateClaimEvidenceInput>;
export type CreateClaimEvidenceMutationError = ErrorType<SemanticProblem>;
export type CreateClaimEvidenceMutationVariables = {
    institutionId: string;
    data: BodyType<CreateClaimEvidenceInput>;
};
export declare const useCreateClaimEvidence: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createClaimEvidence>>, TError, CreateClaimEvidenceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createClaimEvidence>>, TError, CreateClaimEvidenceMutationVariables, TContext>;
export declare const getPrepareOfuqDemoUrl: (institutionId: string) => string;
/**
 * tenant_admin only; flag required. Explicit preparation, never startup seeding.
 */
export declare const prepareOfuqDemo: (institutionId: string, demoPreparationInput: DemoPreparationInput, options?: Parameters<typeof customFetch>[1]) => Promise<DemoScenario>;
export declare const getPrepareOfuqDemoMutationKey: () => readonly ["prepareOfuqDemo"];
export declare const getPrepareOfuqDemoMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof prepareOfuqDemo>>, TError, PrepareOfuqDemoMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof prepareOfuqDemo>>, TError, PrepareOfuqDemoMutationVariables, TContext>;
export type PrepareOfuqDemoMutationResult = NonNullable<Awaited<ReturnType<typeof prepareOfuqDemo>>>;
export type PrepareOfuqDemoMutationBody = BodyType<DemoPreparationInput>;
export type PrepareOfuqDemoMutationError = ErrorType<SemanticProblem>;
export type PrepareOfuqDemoMutationVariables = {
    institutionId: string;
    data: BodyType<DemoPreparationInput>;
};
export declare const usePrepareOfuqDemo: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof prepareOfuqDemo>>, TError, PrepareOfuqDemoMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof prepareOfuqDemo>>, TError, PrepareOfuqDemoMutationVariables, TContext>;
export declare const getResetOfuqDemoUrl: (institutionId: string) => string;
/**
 * tenant_admin only; flag required. Archive generated state for exactly this scenario, retain base inputs, invalidate old leases, increment generation and append audit event. Never reset unrelated simulated data.
 */
export declare const resetOfuqDemo: (institutionId: string, demoResetInput: DemoResetInput, options?: Parameters<typeof customFetch>[1]) => Promise<DemoScenario>;
export declare const getResetOfuqDemoMutationKey: () => readonly ["resetOfuqDemo"];
export declare const getResetOfuqDemoMutationOptions: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resetOfuqDemo>>, TError, ResetOfuqDemoMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof resetOfuqDemo>>, TError, ResetOfuqDemoMutationVariables, TContext>;
export type ResetOfuqDemoMutationResult = NonNullable<Awaited<ReturnType<typeof resetOfuqDemo>>>;
export type ResetOfuqDemoMutationBody = BodyType<DemoResetInput>;
export type ResetOfuqDemoMutationError = ErrorType<SemanticProblem>;
export type ResetOfuqDemoMutationVariables = {
    institutionId: string;
    data: BodyType<DemoResetInput>;
};
export declare const useResetOfuqDemo: <TError = ErrorType<SemanticProblem>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resetOfuqDemo>>, TError, ResetOfuqDemoMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof resetOfuqDemo>>, TError, ResetOfuqDemoMutationVariables, TContext>;
export declare const getListPlansUrl: () => string;
export declare const listPlans: (options?: Parameters<typeof customFetch>[1]) => Promise<PlanDefinition[]>;
export declare const getListPlansQueryKey: () => readonly ["/api/v1/plans"];
export declare const getListPlansQueryOptions: <TData = Awaited<ReturnType<typeof listPlans>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPlans>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPlans>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPlansQueryResult = NonNullable<Awaited<ReturnType<typeof listPlans>>>;
export type ListPlansQueryError = ErrorType<unknown>;
export declare function useListPlans<TData = Awaited<ReturnType<typeof listPlans>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPlans>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getOnboardInstitutionUrl: () => string;
export declare const onboardInstitution: (institutionOnboardingInput: InstitutionOnboardingInput, options?: Parameters<typeof customFetch>[1]) => Promise<InstitutionDetails>;
export declare const getOnboardInstitutionMutationKey: () => readonly ["onboardInstitution"];
export declare const getOnboardInstitutionMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof onboardInstitution>>, TError, OnboardInstitutionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof onboardInstitution>>, TError, OnboardInstitutionMutationVariables, TContext>;
export type OnboardInstitutionMutationResult = NonNullable<Awaited<ReturnType<typeof onboardInstitution>>>;
export type OnboardInstitutionMutationBody = BodyType<InstitutionOnboardingInput>;
export type OnboardInstitutionMutationError = ErrorType<void>;
export type OnboardInstitutionMutationVariables = {
    data: BodyType<InstitutionOnboardingInput>;
};
export declare const useOnboardInstitution: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof onboardInstitution>>, TError, OnboardInstitutionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof onboardInstitution>>, TError, OnboardInstitutionMutationVariables, TContext>;
export declare const getListInstitutionReviewQueueUrl: () => string;
/**
 * @summary List pending institution reviews for authorized platform reviewers
 */
export declare const listInstitutionReviewQueue: (options?: Parameters<typeof customFetch>[1]) => Promise<InstitutionVerificationQueueItem[]>;
export declare const getListInstitutionReviewQueueQueryKey: () => readonly ["/api/v1/platform/institutions/review-queue"];
export declare const getListInstitutionReviewQueueQueryOptions: <TData = Awaited<ReturnType<typeof listInstitutionReviewQueue>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listInstitutionReviewQueue>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listInstitutionReviewQueue>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListInstitutionReviewQueueQueryResult = NonNullable<Awaited<ReturnType<typeof listInstitutionReviewQueue>>>;
export type ListInstitutionReviewQueueQueryError = ErrorType<void>;
/**
 * @summary List pending institution reviews for authorized platform reviewers
 */
export declare function useListInstitutionReviewQueue<TData = Awaited<ReturnType<typeof listInstitutionReviewQueue>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listInstitutionReviewQueue>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getApproveInstitutionLegalVerificationUrl: (institutionId: string) => string;
/**
 * @summary Approve legal verification as an authorized platform reviewer
 */
export declare const approveInstitutionLegalVerification: (institutionId: string, options?: Parameters<typeof customFetch>[1]) => Promise<InstitutionVerificationDecision>;
export declare const getApproveInstitutionLegalVerificationMutationKey: () => readonly ["approveInstitutionLegalVerification"];
export declare const getApproveInstitutionLegalVerificationMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveInstitutionLegalVerification>>, TError, ApproveInstitutionLegalVerificationMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof approveInstitutionLegalVerification>>, TError, ApproveInstitutionLegalVerificationMutationVariables, TContext>;
export type ApproveInstitutionLegalVerificationMutationResult = NonNullable<Awaited<ReturnType<typeof approveInstitutionLegalVerification>>>;
export type ApproveInstitutionLegalVerificationMutationError = ErrorType<void>;
export type ApproveInstitutionLegalVerificationMutationVariables = {
    institutionId: string;
};
/**
* @summary Approve legal verification as an authorized platform reviewer
*/
export declare const useApproveInstitutionLegalVerification: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof approveInstitutionLegalVerification>>, TError, ApproveInstitutionLegalVerificationMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof approveInstitutionLegalVerification>>, TError, ApproveInstitutionLegalVerificationMutationVariables, TContext>;
export declare const getGetInstitutionDetailsUrl: (institutionId: string) => string;
export declare const getInstitutionDetails: (institutionId: string, options?: Parameters<typeof customFetch>[1]) => Promise<InstitutionDetails>;
export declare const getGetInstitutionDetailsQueryKey: (institutionId: string) => readonly [`/api/v1/institutions/${string}`];
export declare const getGetInstitutionDetailsQueryOptions: <TData = Awaited<ReturnType<typeof getInstitutionDetails>>, TError = ErrorType<void>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInstitutionDetails>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getInstitutionDetails>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetInstitutionDetailsQueryResult = NonNullable<Awaited<ReturnType<typeof getInstitutionDetails>>>;
export type GetInstitutionDetailsQueryError = ErrorType<void>;
export declare function useGetInstitutionDetails<TData = Awaited<ReturnType<typeof getInstitutionDetails>>, TError = ErrorType<void>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInstitutionDetails>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateInstitutionSettingsUrl: (institutionId: string) => string;
export declare const updateInstitutionSettings: (institutionId: string, institutionSettingsInput: InstitutionSettingsInput, options?: Parameters<typeof customFetch>[1]) => Promise<InstitutionDetails>;
export declare const getUpdateInstitutionSettingsMutationKey: () => readonly ["updateInstitutionSettings"];
export declare const getUpdateInstitutionSettingsMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateInstitutionSettings>>, TError, UpdateInstitutionSettingsMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateInstitutionSettings>>, TError, UpdateInstitutionSettingsMutationVariables, TContext>;
export type UpdateInstitutionSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof updateInstitutionSettings>>>;
export type UpdateInstitutionSettingsMutationBody = BodyType<InstitutionSettingsInput>;
export type UpdateInstitutionSettingsMutationError = ErrorType<void>;
export type UpdateInstitutionSettingsMutationVariables = {
    institutionId: string;
    data: BodyType<InstitutionSettingsInput>;
};
export declare const useUpdateInstitutionSettings: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateInstitutionSettings>>, TError, UpdateInstitutionSettingsMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateInstitutionSettings>>, TError, UpdateInstitutionSettingsMutationVariables, TContext>;
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPublicStatusUrl: () => string;
/**
 * @summary Get Phase 1 capability status
 */
export declare const getPublicStatus: (options?: Parameters<typeof customFetch>[1]) => Promise<PublicStatus>;
export declare const getGetPublicStatusQueryKey: () => readonly ["/api/v1/public/status"];
export declare const getGetPublicStatusQueryOptions: <TData = Awaited<ReturnType<typeof getPublicStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPublicStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPublicStatus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPublicStatusQueryResult = NonNullable<Awaited<ReturnType<typeof getPublicStatus>>>;
export type GetPublicStatusQueryError = ErrorType<unknown>;
/**
 * @summary Get Phase 1 capability status
 */
export declare function useGetPublicStatus<TData = Awaited<ReturnType<typeof getPublicStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPublicStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListInstitutionsUrl: () => string;
/**
 * @summary List institutions available to the signed-in user
 */
export declare const listInstitutions: (options?: Parameters<typeof customFetch>[1]) => Promise<InstitutionMembership[]>;
export declare const getListInstitutionsQueryKey: () => readonly ["/api/v1/institutions"];
export declare const getListInstitutionsQueryOptions: <TData = Awaited<ReturnType<typeof listInstitutions>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listInstitutions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listInstitutions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListInstitutionsQueryResult = NonNullable<Awaited<ReturnType<typeof listInstitutions>>>;
export type ListInstitutionsQueryError = ErrorType<void>;
/**
 * @summary List institutions available to the signed-in user
 */
export declare function useListInstitutions<TData = Awaited<ReturnType<typeof listInstitutions>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listInstitutions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateInstitutionUrl: () => string;
/**
 * @summary Create an institution and make the signed-in user its administrator
 */
export declare const createInstitution: (institutionInput: InstitutionInput, options?: Parameters<typeof customFetch>[1]) => Promise<InstitutionMembership>;
export declare const getCreateInstitutionMutationKey: () => readonly ["createInstitution"];
export declare const getCreateInstitutionMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createInstitution>>, TError, CreateInstitutionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createInstitution>>, TError, CreateInstitutionMutationVariables, TContext>;
export type CreateInstitutionMutationResult = NonNullable<Awaited<ReturnType<typeof createInstitution>>>;
export type CreateInstitutionMutationBody = BodyType<InstitutionInput>;
export type CreateInstitutionMutationError = ErrorType<void>;
export type CreateInstitutionMutationVariables = {
    data: BodyType<InstitutionInput>;
};
/**
* @summary Create an institution and make the signed-in user its administrator
*/
export declare const useCreateInstitution: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createInstitution>>, TError, CreateInstitutionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createInstitution>>, TError, CreateInstitutionMutationVariables, TContext>;
export declare const getListInstitutionMembersUrl: (institutionId: string) => string;
export declare const listInstitutionMembers: (institutionId: string, options?: Parameters<typeof customFetch>[1]) => Promise<TeamMember[]>;
export declare const getListInstitutionMembersQueryKey: (institutionId: string) => readonly [`/api/v1/institutions/${string}/members`];
export declare const getListInstitutionMembersQueryOptions: <TData = Awaited<ReturnType<typeof listInstitutionMembers>>, TError = ErrorType<void>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listInstitutionMembers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listInstitutionMembers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListInstitutionMembersQueryResult = NonNullable<Awaited<ReturnType<typeof listInstitutionMembers>>>;
export type ListInstitutionMembersQueryError = ErrorType<void>;
export declare function useListInstitutionMembers<TData = Awaited<ReturnType<typeof listInstitutionMembers>>, TError = ErrorType<void>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listInstitutionMembers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAddInstitutionMemberUrl: (institutionId: string) => string;
/**
 * @summary Add an existing identity to an institution with a tenant role
 */
export declare const addInstitutionMember: (institutionId: string, institutionMemberInput: InstitutionMemberInput, options?: Parameters<typeof customFetch>[1]) => Promise<InstitutionMembership>;
export declare const getAddInstitutionMemberMutationKey: () => readonly ["addInstitutionMember"];
export declare const getAddInstitutionMemberMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addInstitutionMember>>, TError, AddInstitutionMemberMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addInstitutionMember>>, TError, AddInstitutionMemberMutationVariables, TContext>;
export type AddInstitutionMemberMutationResult = NonNullable<Awaited<ReturnType<typeof addInstitutionMember>>>;
export type AddInstitutionMemberMutationBody = BodyType<InstitutionMemberInput>;
export type AddInstitutionMemberMutationError = ErrorType<void>;
export type AddInstitutionMemberMutationVariables = {
    institutionId: string;
    data: BodyType<InstitutionMemberInput>;
};
/**
* @summary Add an existing identity to an institution with a tenant role
*/
export declare const useAddInstitutionMember: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addInstitutionMember>>, TError, AddInstitutionMemberMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addInstitutionMember>>, TError, AddInstitutionMemberMutationVariables, TContext>;
export declare const getListOfficialReferencesUrl: (institutionId: string) => string;
/**
 * @summary List official reference records for an institution
 */
export declare const listOfficialReferences: (institutionId: string, options?: Parameters<typeof customFetch>[1]) => Promise<OfficialReference[]>;
export declare const getListOfficialReferencesQueryKey: (institutionId: string) => readonly [`/api/v1/institutions/${string}/official-references`];
export declare const getListOfficialReferencesQueryOptions: <TData = Awaited<ReturnType<typeof listOfficialReferences>>, TError = ErrorType<void>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOfficialReferences>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listOfficialReferences>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListOfficialReferencesQueryResult = NonNullable<Awaited<ReturnType<typeof listOfficialReferences>>>;
export type ListOfficialReferencesQueryError = ErrorType<void>;
/**
 * @summary List official reference records for an institution
 */
export declare function useListOfficialReferences<TData = Awaited<ReturnType<typeof listOfficialReferences>>, TError = ErrorType<void>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOfficialReferences>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateOfficialReferenceUrl: (institutionId: string) => string;
/**
 * Phase 1 records institution-supplied reference details. It does not independently verify the issuing authority or fetch remote content.
 * @summary Record a reference and its first version
 */
export declare const createOfficialReference: (institutionId: string, officialReferenceInput: OfficialReferenceInput, options?: Parameters<typeof customFetch>[1]) => Promise<OfficialReference>;
export declare const getCreateOfficialReferenceMutationKey: () => readonly ["createOfficialReference"];
export declare const getCreateOfficialReferenceMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOfficialReference>>, TError, CreateOfficialReferenceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createOfficialReference>>, TError, CreateOfficialReferenceMutationVariables, TContext>;
export type CreateOfficialReferenceMutationResult = NonNullable<Awaited<ReturnType<typeof createOfficialReference>>>;
export type CreateOfficialReferenceMutationBody = BodyType<OfficialReferenceInput>;
export type CreateOfficialReferenceMutationError = ErrorType<void>;
export type CreateOfficialReferenceMutationVariables = {
    institutionId: string;
    data: BodyType<OfficialReferenceInput>;
};
/**
* @summary Record a reference and its first version
*/
export declare const useCreateOfficialReference: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOfficialReference>>, TError, CreateOfficialReferenceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createOfficialReference>>, TError, CreateOfficialReferenceMutationVariables, TContext>;
export declare const getListMonitorSourcesUrl: (institutionId: string) => string;
/**
 * @summary List institution source records
 */
export declare const listMonitorSources: (institutionId: string, options?: Parameters<typeof customFetch>[1]) => Promise<MonitorSource[]>;
export declare const getListMonitorSourcesQueryKey: (institutionId: string) => readonly [`/api/v1/institutions/${string}/monitor-sources`];
export declare const getListMonitorSourcesQueryOptions: <TData = Awaited<ReturnType<typeof listMonitorSources>>, TError = ErrorType<void>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMonitorSources>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listMonitorSources>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListMonitorSourcesQueryResult = NonNullable<Awaited<ReturnType<typeof listMonitorSources>>>;
export type ListMonitorSourcesQueryError = ErrorType<void>;
/**
 * @summary List institution source records
 */
export declare function useListMonitorSources<TData = Awaited<ReturnType<typeof listMonitorSources>>, TError = ErrorType<void>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listMonitorSources>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateMonitorSourceUrl: (institutionId: string) => string;
/**
 * Does not activate or imply automated monitoring.
 * @summary Register a source for manual submission
 */
export declare const createMonitorSource: (institutionId: string, monitorSourceInput: MonitorSourceInput, options?: Parameters<typeof customFetch>[1]) => Promise<MonitorSource>;
export declare const getCreateMonitorSourceMutationKey: () => readonly ["createMonitorSource"];
export declare const getCreateMonitorSourceMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMonitorSource>>, TError, CreateMonitorSourceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createMonitorSource>>, TError, CreateMonitorSourceMutationVariables, TContext>;
export type CreateMonitorSourceMutationResult = NonNullable<Awaited<ReturnType<typeof createMonitorSource>>>;
export type CreateMonitorSourceMutationBody = BodyType<MonitorSourceInput>;
export type CreateMonitorSourceMutationError = ErrorType<void>;
export type CreateMonitorSourceMutationVariables = {
    institutionId: string;
    data: BodyType<MonitorSourceInput>;
};
/**
* @summary Register a source for manual submission
*/
export declare const useCreateMonitorSource: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createMonitorSource>>, TError, CreateMonitorSourceMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createMonitorSource>>, TError, CreateMonitorSourceMutationVariables, TContext>;
export declare const getListObservedContentUrl: (institutionId: string) => string;
/**
 * @summary List manually submitted content observations
 */
export declare const listObservedContent: (institutionId: string, options?: Parameters<typeof customFetch>[1]) => Promise<ObservedContent[]>;
export declare const getListObservedContentQueryKey: (institutionId: string) => readonly [`/api/v1/institutions/${string}/observed-content`];
export declare const getListObservedContentQueryOptions: <TData = Awaited<ReturnType<typeof listObservedContent>>, TError = ErrorType<void>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listObservedContent>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listObservedContent>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListObservedContentQueryResult = NonNullable<Awaited<ReturnType<typeof listObservedContent>>>;
export type ListObservedContentQueryError = ErrorType<void>;
/**
 * @summary List manually submitted content observations
 */
export declare function useListObservedContent<TData = Awaited<ReturnType<typeof listObservedContent>>, TError = ErrorType<void>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listObservedContent>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateObservedContentUrl: (institutionId: string) => string;
/**
 * Phase 1 accepts only manual submissions. The server sets isSimulated; clients cannot label submitted content as live monitoring.
 * @summary Record a manually submitted content observation
 */
export declare const createObservedContent: (institutionId: string, observedContentInput: ObservedContentInput, options?: Parameters<typeof customFetch>[1]) => Promise<ObservedContent>;
export declare const getCreateObservedContentMutationKey: () => readonly ["createObservedContent"];
export declare const getCreateObservedContentMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createObservedContent>>, TError, CreateObservedContentMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createObservedContent>>, TError, CreateObservedContentMutationVariables, TContext>;
export type CreateObservedContentMutationResult = NonNullable<Awaited<ReturnType<typeof createObservedContent>>>;
export type CreateObservedContentMutationBody = BodyType<ObservedContentInput>;
export type CreateObservedContentMutationError = ErrorType<void>;
export type CreateObservedContentMutationVariables = {
    institutionId: string;
    data: BodyType<ObservedContentInput>;
};
/**
* @summary Record a manually submitted content observation
*/
export declare const useCreateObservedContent: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createObservedContent>>, TError, CreateObservedContentMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createObservedContent>>, TError, CreateObservedContentMutationVariables, TContext>;
export declare const getListCasesUrl: (institutionId: string) => string;
/**
 * @summary List institution cases
 */
export declare const listCases: (institutionId: string, options?: Parameters<typeof customFetch>[1]) => Promise<Case[]>;
export declare const getListCasesQueryKey: (institutionId: string) => readonly [`/api/v1/institutions/${string}/cases`];
export declare const getListCasesQueryOptions: <TData = Awaited<ReturnType<typeof listCases>>, TError = ErrorType<void>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCases>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCasesQueryResult = NonNullable<Awaited<ReturnType<typeof listCases>>>;
export type ListCasesQueryError = ErrorType<void>;
/**
 * @summary List institution cases
 */
export declare function useListCases<TData = Awaited<ReturnType<typeof listCases>>, TError = ErrorType<void>>(institutionId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCases>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCaseUrl: (institutionId: string) => string;
/**
 * Does not represent an automated drift detection.
 * @summary Open a manually initiated case
 */
export declare const createCase: (institutionId: string, caseInput: CaseInput, options?: Parameters<typeof customFetch>[1]) => Promise<Case>;
export declare const getCreateCaseMutationKey: () => readonly ["createCase"];
export declare const getCreateCaseMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCase>>, TError, CreateCaseMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCase>>, TError, CreateCaseMutationVariables, TContext>;
export type CreateCaseMutationResult = NonNullable<Awaited<ReturnType<typeof createCase>>>;
export type CreateCaseMutationBody = BodyType<CaseInput>;
export type CreateCaseMutationError = ErrorType<void>;
export type CreateCaseMutationVariables = {
    institutionId: string;
    data: BodyType<CaseInput>;
};
/**
* @summary Open a manually initiated case
*/
export declare const useCreateCase: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCase>>, TError, CreateCaseMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCase>>, TError, CreateCaseMutationVariables, TContext>;
export declare const getCreateResponseDraftUrl: (institutionId: string, caseId: string) => string;
/**
 * Phase 1 does not generate AI response drafts.
 * @summary Save a human-authored response draft
 */
export declare const createResponseDraft: (institutionId: string, caseId: string, responseDraftInput: ResponseDraftInput, options?: Parameters<typeof customFetch>[1]) => Promise<ResponseDraft>;
export declare const getCreateResponseDraftMutationKey: () => readonly ["createResponseDraft"];
export declare const getCreateResponseDraftMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createResponseDraft>>, TError, CreateResponseDraftMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createResponseDraft>>, TError, CreateResponseDraftMutationVariables, TContext>;
export type CreateResponseDraftMutationResult = NonNullable<Awaited<ReturnType<typeof createResponseDraft>>>;
export type CreateResponseDraftMutationBody = BodyType<ResponseDraftInput>;
export type CreateResponseDraftMutationError = ErrorType<void>;
export type CreateResponseDraftMutationVariables = {
    institutionId: string;
    caseId: string;
    data: BodyType<ResponseDraftInput>;
};
/**
* @summary Save a human-authored response draft
*/
export declare const useCreateResponseDraft: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createResponseDraft>>, TError, CreateResponseDraftMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createResponseDraft>>, TError, CreateResponseDraftMutationVariables, TContext>;
export declare const getCreateReviewStepUrl: (institutionId: string, caseId: string) => string;
/**
 * @summary Add an ordered human review step
 */
export declare const createReviewStep: (institutionId: string, caseId: string, reviewStepInput: ReviewStepInput, options?: Parameters<typeof customFetch>[1]) => Promise<ReviewStep>;
export declare const getCreateReviewStepMutationKey: () => readonly ["createReviewStep"];
export declare const getCreateReviewStepMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createReviewStep>>, TError, CreateReviewStepMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createReviewStep>>, TError, CreateReviewStepMutationVariables, TContext>;
export type CreateReviewStepMutationResult = NonNullable<Awaited<ReturnType<typeof createReviewStep>>>;
export type CreateReviewStepMutationBody = BodyType<ReviewStepInput>;
export type CreateReviewStepMutationError = ErrorType<void>;
export type CreateReviewStepMutationVariables = {
    institutionId: string;
    caseId: string;
    data: BodyType<ReviewStepInput>;
};
/**
* @summary Add an ordered human review step
*/
export declare const useCreateReviewStep: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createReviewStep>>, TError, CreateReviewStepMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createReviewStep>>, TError, CreateReviewStepMutationVariables, TContext>;
export declare const getSubmitReviewDecisionUrl: (institutionId: string, caseId: string, stepId: string) => string;
/**
 * @summary Submit a decision for the currently assigned human review step
 */
export declare const submitReviewDecision: (institutionId: string, caseId: string, stepId: string, reviewDecisionInput: ReviewDecisionInput, options?: Parameters<typeof customFetch>[1]) => Promise<ReviewStep>;
export declare const getSubmitReviewDecisionMutationKey: () => readonly ["submitReviewDecision"];
export declare const getSubmitReviewDecisionMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitReviewDecision>>, TError, SubmitReviewDecisionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof submitReviewDecision>>, TError, SubmitReviewDecisionMutationVariables, TContext>;
export type SubmitReviewDecisionMutationResult = NonNullable<Awaited<ReturnType<typeof submitReviewDecision>>>;
export type SubmitReviewDecisionMutationBody = BodyType<ReviewDecisionInput>;
export type SubmitReviewDecisionMutationError = ErrorType<void>;
export type SubmitReviewDecisionMutationVariables = {
    institutionId: string;
    caseId: string;
    stepId: string;
    data: BodyType<ReviewDecisionInput>;
};
/**
* @summary Submit a decision for the currently assigned human review step
*/
export declare const useSubmitReviewDecision: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitReviewDecision>>, TError, SubmitReviewDecisionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof submitReviewDecision>>, TError, SubmitReviewDecisionMutationVariables, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map