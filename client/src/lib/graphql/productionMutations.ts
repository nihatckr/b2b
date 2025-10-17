import { gql } from "urql";

export const ADD_PRODUCTION_STAGE_UPDATE = gql`
  mutation AddProductionStageUpdate(
    $productionId: Int!
    $stage: ProductionStage!
    $notes: String
    $photos: String
    $hasDelay: Boolean!
    $delayReason: String
    $extraDays: Int
  ) {
    addProductionStageUpdate(
      productionId: $productionId
      stage: $stage
      notes: $notes
      photos: $photos
      hasDelay: $hasDelay
      delayReason: $delayReason
      extraDays: $extraDays
    ) {
      id
      productionId
      stage
      status
      notes
      photos
      isRevision
      extraDays
      createdAt
    }
  }
`;

export const COMPLETE_PRODUCTION_STAGE = gql`
  mutation CompleteProductionStage(
    $productionId: Int!
    $stage: ProductionStage!
  ) {
    completeProductionStage(
      productionId: $productionId
      stage: $stage
    ) {
      id
      currentStage
      overallStatus
      progress
    }
  }
`;

export const REVERT_PRODUCTION_STAGE = gql`
  mutation RevertProductionStage(
    $productionId: Int!
    $targetStage: ProductionStage!
  ) {
    revertProductionStage(
      productionId: $productionId
      targetStage: $targetStage
    ) {
      id
      currentStage
      overallStatus
      progress
    }
  }
`;
