import { gql } from "urql";

export const ASK_QUESTION_MUTATION = gql`
  mutation AskQuestion($input: CreateQuestionInput!) {
    askQuestion(input: $input) {
      id
      question
      answer
      isAnswered
      isPublic
      collectionId
      createdAt
      customer {
        id
        firstName
        lastName
        name
      }
      manufacture {
        id
        firstName
        lastName
        name
      }
    }
  }
`;

export const ANSWER_QUESTION_MUTATION = gql`
  mutation AnswerQuestion($input: AnswerQuestionInput!) {
    answerQuestion(input: $input) {
      id
      question
      answer
      isAnswered
      createdAt
    }
  }
`;

export const DELETE_QUESTION_MUTATION = gql`
  mutation DeleteQuestion($id: Int!) {
    deleteQuestion(id: $id) {
      id
    }
  }
`;

export const COLLECTION_QUESTIONS_QUERY = gql`
  query CollectionQuestions($collectionId: Int, $includePrivate: Boolean) {
    collectionQuestions(
      collectionId: $collectionId
      includePrivate: $includePrivate
    ) {
      id
      question
      answer
      isAnswered
      isPublic
      createdAt
      customer {
        id
        firstName
        lastName
        name
      }
      manufacture {
        id
        firstName
        lastName
        name
      }
    }
  }
`;

export const MY_QUESTIONS_QUERY = gql`
  query MyQuestions {
    myQuestions {
      id
      question
      answer
      isAnswered
      isPublic
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
      }
    }
  }
`;

export const UNANSWERED_QUESTIONS_QUERY = gql`
  query UnansweredQuestions {
    unansweredQuestions {
      id
      question
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
