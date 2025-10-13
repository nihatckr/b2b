import { gql } from "urql";

export const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      rating
      comment
      isApproved
      collectionId
      createdAt
      customer {
        id
        firstName
        lastName
        name
      }
    }
  }
`;

export const APPROVE_REVIEW_MUTATION = gql`
  mutation ApproveReview($input: ApproveReviewInput!) {
    approveReview(input: $input) {
      id
      isApproved
    }
  }
`;

export const DELETE_REVIEW_MUTATION = gql`
  mutation DeleteReview($id: Int!) {
    deleteReview(id: $id) {
      id
    }
  }
`;

export const COLLECTION_REVIEWS_QUERY = gql`
  query CollectionReviews($collectionId: Int, $approvedOnly: Boolean) {
    collectionReviews(
      collectionId: $collectionId
      approvedOnly: $approvedOnly
    ) {
      id
      rating
      comment
      isApproved
      createdAt
      customer {
        id
        firstName
        lastName
        name
        company {
          id
          name
        }
      }
    }
  }
`;

export const COLLECTION_AVERAGE_RATING_QUERY = gql`
  query CollectionAverageRating($collectionId: Int) {
    collectionAverageRating(collectionId: $collectionId)
  }
`;

export const MY_REVIEWS_QUERY = gql`
  query MyReviews {
    myReviews {
      id
      rating
      comment
      isApproved
      collectionId
      createdAt
      collection {
        id
        name
      }
    }
  }
`;

export const PENDING_REVIEWS_QUERY = gql`
  query PendingReviews {
    pendingReviews {
      id
      rating
      comment
      collectionId
      createdAt
      collection {
        id
        name
      }
      customer {
        id
        firstName
        lastName
        email
      }
    }
  }
`;
