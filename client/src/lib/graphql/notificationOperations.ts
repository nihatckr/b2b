import { gql } from "urql";

export const MY_NOTIFICATIONS_QUERY = gql`
  query MyNotifications($limit: Int, $offset: Int, $unreadOnly: Boolean) {
    myNotifications(limit: $limit, offset: $offset, unreadOnly: $unreadOnly) {
      id
      type
      title
      message
      link
      isRead
      createdAt
      updatedAt
    }
  }
`;

export const UNREAD_NOTIFICATION_COUNT_QUERY = gql`
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`;

export const MARK_NOTIFICATION_AS_READ_MUTATION = gql`
  mutation MarkNotificationAsRead($id: Int!) {
    markNotificationAsRead(id: $id) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

export const DELETE_NOTIFICATION_MUTATION = gql`
  mutation DeleteNotification($id: Int!) {
    deleteNotification(id: $id) {
      id
    }
  }
`;
