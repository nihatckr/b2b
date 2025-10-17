import { gql } from "urql";

// Legacy queries - to be replaced by analytics-operations.graphql
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
