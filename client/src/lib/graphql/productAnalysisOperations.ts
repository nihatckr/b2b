import { gql } from "urql";

export const ANALYZE_PRODUCT_WITH_OLLAMA = gql`
  mutation AnalyzeProductWithOllama($imageUrl: String!, $userNotes: String) {
    analyzeProductWithOllama(imageUrl: $imageUrl, userNotes: $userNotes) {
      productType
      category
      colors
      material
      pattern
      style
      neckline
      sleeves
      fit
      details
      suggestedModels {
        variant
        prompt
      }
      designPrompt
      rawResponse
    }
  }
`;

// Commented out - not implemented in schema yet
// export const CHECK_OLLAMA_STATUS = gql`
//   query CheckOllamaStatus {
//     checkOllamaStatus {
//       running
//       modelAvailable
//       availableModels
//     }
//   }
// `;
