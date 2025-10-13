import { gql } from "urql";

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($input: CreateMessageInput!) {
    sendMessage(input: $input) {
      id
      content
      senderId
      receiver
      isRead
      type
      createdAt
      sender {
        id
        name
        firstName
        lastName
        email
      }
      company {
        id
        name
      }
    }
  }
`;

export const MARK_MESSAGE_READ_MUTATION = gql`
  mutation MarkMessageAsRead($id: Int!) {
    markMessageAsRead(id: $id) {
      id
      isRead
    }
  }
`;

export const DELETE_MESSAGE_MUTATION = gql`
  mutation DeleteMessage($id: Int!) {
    deleteMessage(id: $id) {
      id
    }
  }
`;

export const MY_MESSAGES_QUERY = gql`
  query MyMessages($filter: MessageFilterInput) {
    myMessages(filter: $filter) {
      id
      content
      senderId
      receiver
      isRead
      type
      createdAt
      sender {
        id
        name
        firstName
        lastName
        email
        company {
          id
          name
        }
      }
      company {
        id
        name
      }
    }
  }
`;

export const UNREAD_COUNT_QUERY = gql`
  query UnreadMessageCount {
    unreadMessageCount
  }
`;

export const COMPANY_MESSAGES_QUERY = gql`
  query CompanyMessages($companyId: Int) {
    companyMessages(companyId: $companyId) {
      id
      content
      senderId
      receiver
      isRead
      type
      createdAt
      sender {
        id
        name
        firstName
        lastName
        email
      }
      company {
        id
        name
      }
    }
  }
`;
