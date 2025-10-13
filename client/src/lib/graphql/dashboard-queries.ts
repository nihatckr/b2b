import { gql } from "urql";

export const DASHBOARD_STATS_QUERY = gql`
  query DashboardStats {
    collections(isActive: true) {
      id
      name
      createdAt
    }
    samples {
      id
      status
      createdAt
    }
    orders {
      id
      status
      totalPrice
      createdAt
    }
    allUsers {
      id
      role
      createdAt
    }
  }
`;

export const USER_STATS_QUERY = gql`
  query UserStats {
    userStats {
      totalUsers
      adminCount
      manufactureCount
      customerCount
    }
  }
`;

export const MY_STATS_QUERY = gql`
  query MyStats {
    mySamples {
      id
      status
      createdAt
    }
    myOrders {
      id
      status
      totalPrice
      createdAt
    }
  }
`;
