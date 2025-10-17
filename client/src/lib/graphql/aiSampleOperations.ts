import { gql } from "urql";

export const GET_AI_SAMPLES = gql`
  query GetAISamples($limit: Int) {
    samples(limit: $limit) {
      id
      sampleNumber
      name
      description
      status
      images
      aiGenerated
      aiPrompt
      aiSketchUrl
      createdAt
    }
  }
`;

export const GENERATE_SAMPLE_DESIGN = gql`
  mutation GenerateSampleDesign(
    $sketchUrl: String!
    $prompt: String!
    $negativePrompt: String
    $width: Int
    $height: Int
    $steps: Int
    $cfgScale: Float
    $collectionId: Int
    $sampleName: String
    $description: String
  ) {
    generateSampleDesign(
      sketchUrl: $sketchUrl
      prompt: $prompt
      negativePrompt: $negativePrompt
      width: $width
      height: $height
      steps: $steps
      cfgScale: $cfgScale
      collectionId: $collectionId
      sampleName: $sampleName
      description: $description
    ) {
      id
      sampleNumber
      name
      description
      status
      images
      aiGenerated
      aiPrompt
      aiSketchUrl
      createdAt
    }
  }
`;

export const GENERATE_DESIGN_FROM_TEXT = gql`
  mutation GenerateDesignFromText(
    $prompt: String!
    $negativePrompt: String
    $width: Int
    $height: Int
    $steps: Int
    $cfgScale: Float
    $collectionId: Int
    $sampleName: String
    $description: String
    $workflowName: String
  ) {
    generateDesignFromText(
      prompt: $prompt
      negativePrompt: $negativePrompt
      width: $width
      height: $height
      steps: $steps
      cfgScale: $cfgScale
      collectionId: $collectionId
      sampleName: $sampleName
      description: $description
      workflowName: $workflowName
    ) {
      id
      sampleNumber
      name
      description
      status
      images
      aiGenerated
      aiPrompt
      aiSketchUrl
      createdAt
    }
  }
`;
