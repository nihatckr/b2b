import { gql } from "urql";

export const UPDATE_PRODUCTION_STAGE_MUTATION = gql`
  mutation UpdateProductionStage($input: UpdateProductionStageInput!) {
    updateProductionStage(input: $input) {
      id
      currentStage
      overallStatus
      progress
      estimatedStartDate
      estimatedEndDate
      actualStartDate
      actualEndDate
      notes
      createdAt
      updatedAt
    }
  }
`;

export const PRODUCTION_TRACKING_QUERY = gql`
  query ProductionTracking($id: Int, $orderId: Int, $sampleId: Int) {
    productionTracking(id: $id, orderId: $orderId, sampleId: $sampleId) {
      id
      orderId
      sampleId
      currentStage
      overallStatus
      progress
      estimatedStartDate
      estimatedEndDate
      actualStartDate
      actualEndDate
      notes
      createdAt
      updatedAt
      order {
        id
        orderNumber
      }
      sample {
        id
        sampleNumber
      }
      stageUpdates {
        id
        stage
        status
        actualStartDate
        actualEndDate
        estimatedDays
        notes
        photos
        isRevision
        extraDays
        createdAt
      }
      qualityControls {
        id
        checkDate
        result
        score
        notes
        photos
        fabricDefects
        sewingDefects
        measureDefects
        finishingDefects
        createdAt
        inspector {
          id
          firstName
          lastName
        }
      }
    }
  }
`;
