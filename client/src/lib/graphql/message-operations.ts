import { gql } from "urql";

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($input: CreateMessageInput!) {
    sendMessage(input: $input) {
      id
      content
      senderId
      receiverId
      isRead
      type
      orderId
      sampleId
      createdAt
      sender {
        id
        firstName
        lastName
        email
      }
      receiver {
        id
        firstName
        lastName
        email
      }
      order {
        id
        orderNumber
        collection {
          id
          name
        }
      }
      sample {
        id
        sampleNumber
        name
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
      receiverId
      isRead
      type
      orderId
      sampleId
      createdAt
      sender {
        id
        firstName
        lastName
        email
        company {
          id
          name
        }
      }
      receiver {
        id
        firstName
        lastName
        email
      }
      order {
        id
        orderNumber
        collection {
          id
          name
        }
      }
      sample {
        id
        sampleNumber
        name
      }
      company {
        id
        name
      }
    }
  }
`;

export const PRODUCT_MESSAGES_QUERY = gql`
  query ProductMessages($orderId: Int, $sampleId: Int) {
    productMessages(orderId: $orderId, sampleId: $sampleId) {
      id
      content
      senderId
      receiverId
      isRead
      type
      createdAt
      sender {
        id
        firstName
        lastName
        email
        company {
          id
          name
        }
      }
      receiver {
        id
        firstName
        lastName
        email
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
      receiverId
      isRead
      type
      orderId
      sampleId
      createdAt
      sender {
        id
        firstName
        lastName
        email
      }
      receiver {
        id
        firstName
        lastName
        email
      }
      order {
        id
        orderNumber
      }
      sample {
        id
        sampleNumber
      }
      company {
        id
        name
      }
    }
  }
`;
