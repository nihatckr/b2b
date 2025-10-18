import { gql } from "urql";

export const DASHBOARD_STATS_QUERY = gql`
  query DashboardStats {
    dashboardStats {
      totalCollections
      totalSamples
      totalOrders
      totalProductions
      pendingSamples
      activeSamples
      completedSamples
      pendingOrders
      activeOrders
      completedOrders
      passedQC
      failedQC
      qcPassRate
      monthlyStats {
        month
        samples
        orders
        completedProductions
        revenue
      }
      recentSamples {
        id
        name
        status
        createdAt
      }
      recentOrders {
        id
        orderNumber
        status
        createdAt
      }
    }
  }
`;

export const USER_STATS_QUERY = gql`
  query UserStats {
    userStats {
      totalUsers
      activeUsers
      totalCollections
      totalOrders
    }
  }
`;

export const MANUFACTURER_ORDERS_QUERY = gql`
  query ManufacturerOrders($limit: Int, $offset: Int) {
    manufacturerOrders(first: $limit, skip: $offset) {
      id
      orderNumber
      status
      totalQuantity
      createdAt
      client {
        id
        email
      }
    }
  }
`;
