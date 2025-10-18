import { gql } from "urql";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      firstName
      lastName
      role
      companyId
      isCompanyOwner
      isPendingApproval
      department
      jobTitle
      permissions
      isActive
      createdAt
      updatedAt
      company {
        id
        name
        type
        email
      }
    }
  }
`;

export const ALL_USERS_QUERY = gql`
  query AllUsers($searchString: String, $role: Role, $skip: Int, $take: Int) {
    allUsers(
      searchString: $searchString
      role: $role
      skip: $skip
      take: $take
    ) {
      company {
        address
        createdAt
        description
        email
        id
        isActive
        name
        phone
        updatedAt

        website
      }
      companyId
      createdAt
      email
      firstName
      id
      username
      updatedAt
      role
      phone
      name
      lastName
      isActive
    }
  }
`;

export const ALL_MANUFACTURERS_QUERY = gql`
  query AllManufacturers {
    allManufacturers {
      id
      name
      firstName
      lastName
      email
      phone
      companyId
      company {
        id
        name
      }
    }
  }
`;

export const ALL_COMPANIES_QUERY = gql`
  query AllCompanies {
    allCompanies {
      id
      name
      email
      phone
      address
      website
      isActive
      users {
        id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const ALL_CATEGORIES_QUERY = gql`
  query AllCategories {
    allCategories {
      id
      name
      description
      collectionsCount
      author {
        id
        name
      }
      company {
        id
        name
      }
      parentCategory {
        id
        name
      }
      subCategories {
        id
        name
        collectionsCount
      }
      createdAt
      updatedAt
    }
  }
`;

export const ROOT_CATEGORIES_QUERY = gql`
  query RootCategories {
    rootCategories {
      id
      name
      description
      collectionsCount
      author {
        id
        name
      }
      company {
        id
        name
      }
      subCategories {
        id
        name
        description
        collectionsCount
        subCategories {
          id
          name
          collectionsCount
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const CATEGORY_TREE_QUERY = gql`
  query CategoryTree {
    categoryTree {
      id
      name
      description
      collectionsCount
      author {
        id
        name
      }
      company {
        id
        name
      }
      subCategories {
        id
        name
        description
        collectionsCount
        subCategories {
          id
          name
          collectionsCount
        }
      }
    }
  }
`;

export const COMPANY_QUERY = gql`
  query Company($companyId: Int) {
    company(id: $companyId) {
      address
      createdAt
      description
      email
      id
      isActive
      name
      phone
      updatedAt
      website
      users {
        id
        firstName
        email
        createdAt
        companyId
        isActive
        lastName
        name
        phone
        role
        updatedAt
        username
      }
    }
  }
`;

// Collection Queries
export const ALL_COLLECTIONS_QUERY = gql`
  query AllCollections(
    $categoryId: Int
    $companyId: Int
    $isActive: Boolean
    $isFeatured: Boolean
    $search: String
    $limit: Int
    $offset: Int
  ) {
    collections(
      categoryId: $categoryId
      companyId: $companyId
      isActive: $isActive
      isFeatured: $isFeatured
      search: $search
      limit: $limit
      offset: $offset
    ) {
      id
      name
      description
      price
      sku
      stock
      images
      isActive
      isFeatured
      slug
      productionSchedule
      createdAt
      updatedAt
      # Model Bilgileri
      modelCode
      season
      gender
      fit
      trend
      # Varyantlar
      colors
      sizeRange
      measurementChart
      # Teknik Detaylar
      fabricComposition
      accessories
      techPack
      # Ticari Bilgiler
      moq
      targetPrice
      targetLeadTime
      notes
      # Beğeni
      likesCount
      category {
        id
        name
      }
      company {
        id
        name
        address
        location
      }
      author {
        id
        name
        firstName
        lastName
      }
      # Sertifikalar
      certifications {
        id
        name
        category
        code
      }
      samplesCount
      ordersCount
    }
  }
`;

export const COLLECTION_BY_ID_QUERY = gql`
  query CollectionById($id: Int!) {
    collection(id: $id) {
      id
      name
      description
      price
      sku
      stock
      images
      isActive
      isFeatured
      slug
      productionSchedule
      createdAt
      updatedAt
      category {
        id
        name
        description
        company {
          id
          name
        }
      }
      company {
        id
        name
        email
        website
      }
      author {
        id
        name
        firstName
        lastName
        email
      }
      samplesCount
      ordersCount
    }
  }
`;

export const COLLECTIONS_BY_CATEGORY_QUERY = gql`
  query CollectionsByCategory(
    $categoryId: Int!
    $includeSubcategories: Boolean
  ) {
    collectionsByCategory(
      categoryId: $categoryId
      includeSubcategories: $includeSubcategories
    ) {
      id
      name
      description
      price
      sku
      stock
      images
      isActive
      isFeatured
      slug
      productionSchedule
      createdAt
      category {
        id
        name
      }
      company {
        id
        name
      }
      author {
        id
        name
      }
      samplesCount
      ordersCount
    }
  }
`;

export const MY_COLLECTIONS_QUERY = gql`
  query MyCollections {
    myCollections {
      id
      name
      description
      price
      sku
      stock
      images
      isActive
      isFeatured
      slug
      productionSchedule
      createdAt
      updatedAt
      category {
        id
        name
      }
      company {
        id
        name
      }
      author {
        id
        name
      }
      samplesCount
      ordersCount
    }
  }
`;

export const FEATURED_COLLECTIONS_QUERY = gql`
  query FeaturedCollections($limit: Int) {
    featuredCollections(limit: $limit) {
      id
      name
      description
      price
      sku
      stock
      images
      isActive
      isFeatured
      slug
      productionSchedule
      createdAt
      category {
        id
        name
      }
      company {
        id
        name
      }
      author {
        id
        name
      }
      samplesCount
      ordersCount
    }
  }
`;

// Sample Queries
export const ALL_SAMPLES_QUERY = gql`
  query AllSamples(
    $status: SampleStatus
    $sampleType: SampleType
    $customerId: Int
    $manufactureId: Int
    $companyId: Int
    $search: String
    $limit: Int
    $offset: Int
  ) {
    samples(
      status: $status
      sampleType: $sampleType
      customerId: $customerId
      manufactureId: $manufactureId
      companyId: $companyId
      search: $search
      limit: $limit
      offset: $offset
    ) {
      id
      sampleNumber
      sampleType
      status
      customerNote
      manufacturerResponse
      productionDays
      estimatedProductionDate
      actualProductionDate
      shippingDate
      cargoTrackingNumber
      deliveryAddress
      createdAt
      updatedAt
      aiGenerated
      aiPrompt
      aiSketchUrl
      images
      collection {
        id
        name
        images
      }
      originalCollection {
        id
        name
      }
      customer {
        id
        name
        firstName
        lastName
        email
      }
      manufacture {
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

export const SAMPLE_BY_ID_QUERY = gql`
  query SampleById($id: Int!) {
    sample(id: $id) {
      id
      sampleNumber
      sampleType
      status
      customerNote
      manufacturerResponse
      customDesignImages
      revisionRequests
      originalCollectionId
      productionDays
      estimatedProductionDate
      actualProductionDate
      shippingDate
      cargoTrackingNumber
      deliveryAddress
      createdAt
      updatedAt
      collection {
        id
        name
        description
        price
        images
        category {
          id
          name
        }
      }
      originalCollection {
        id
        name
        images
      }
      customer {
        id
        name
        firstName
        lastName
        email
        phone
      }
      manufacture {
        id
        name
        firstName
        lastName
        email
        phone
      }
      company {
        id
        name
        email
        phone
      }
    }
  }
`;

export const MY_SAMPLES_QUERY = gql`
  query MySamples($status: SampleStatus, $sampleType: SampleType) {
    mySamples(status: $status, sampleType: $sampleType) {
      id
      sampleNumber
      sampleType
      status
      customerNote
      manufacturerResponse
      productionDays
      estimatedProductionDate
      actualProductionDate
      createdAt
      updatedAt
      aiGenerated
      aiPrompt
      aiSketchUrl
      images
      collection {
        id
        name
        images
        modelCode
      }
      originalCollection {
        id
        name
      }
      customer {
        id
        name
        firstName
        lastName
        email
      }
      manufacture {
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
    }
  }
`;

export const ASSIGNED_SAMPLES_QUERY = gql`
  query AssignedSamples($status: SampleStatus, $sampleType: SampleType) {
    assignedSamples(status: $status, sampleType: $sampleType) {
      id
      sampleNumber
      sampleType
      status
      customerNote
      productionDays
      estimatedProductionDate
      createdAt
      aiGenerated
      aiPrompt
      aiSketchUrl
      images
      collection {
        id
        name
        images
      }
      customer {
        id
        name
        firstName
        lastName
        email
      }
    }
  }
`;

export const SAMPLE_PRODUCTION_HISTORY_QUERY = gql`
  query SampleProductionHistory($sampleId: Int!) {
    sampleProductionHistory(sampleId: $sampleId) {
      id
      status
      note
      estimatedDays
      actualDate
      createdAt
      updatedBy {
        id
        name
        firstName
        lastName
      }
    }
  }
`;

// Order Queries
export const ALL_ORDERS_QUERY = gql`
  query AllOrders(
    $status: OrderStatus
    $customerId: Int
    $manufactureId: Int
    $companyId: Int
    $search: String
    $limit: Int
    $offset: Int
  ) {
    orders(
      status: $status
      customerId: $customerId
      manufactureId: $manufactureId
      companyId: $companyId
      search: $search
      limit: $limit
      offset: $offset
    ) {
      id
      orderNumber
      status
      quantity
      unitPrice
      totalPrice
      customerNote
      manufacturerResponse
      productionDays
      estimatedProductionDate
      actualProductionStart
      actualProductionEnd
      shippingDate
      cargoTrackingNumber
      createdAt
      updatedAt
      collection {
        id
        name
        modelCode
        images
      }
      customer {
        id
        name
        firstName
        lastName
        email
      }
      manufacture {
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

export const ORDER_BY_ID_QUERY = gql`
  query OrderById($id: Int!) {
    order(id: $id) {
      id
      orderNumber
      status
      quantity
      unitPrice
      totalPrice
      customerNote
      manufacturerResponse
      customerQuotedPrice
      customerQuoteDays
      customerQuoteNote
      customerQuoteType
      customerQuoteSentAt
      specifications
      deliveryAddress
      cargoTrackingNumber
      productionDays
      estimatedProductionDate
      actualProductionStart
      actualProductionEnd
      shippingDate
      createdAt
      updatedAt
      collection {
        id
        name
        description
        price
        images
      }
      customer {
        id
        name
        firstName
        lastName
        email
        phone
      }
      manufacture {
        id
        name
        firstName
        lastName
        email
        phone
      }
      company {
        id
        name
      }
    }
  }
`;

export const MY_ORDERS_QUERY = gql`
  query MyOrders($status: OrderStatus) {
    myOrders(status: $status) {
      id
      orderNumber
      status
      quantity
      unitPrice
      totalPrice
      productionDays
      estimatedProductionDate
      actualProductionStart
      customerNote
      manufacturerResponse
      createdAt
      updatedAt
      collection {
        id
        name
        modelCode
        images
      }
      customer {
        id
        name
        firstName
        lastName
        email
      }
      manufacture {
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
    }
  }
`;

export const ASSIGNED_ORDERS_QUERY = gql`
  query AssignedOrders($status: OrderStatus) {
    assignedOrders(status: $status) {
      id
      orderNumber
      status
      quantity
      unitPrice
      totalPrice
      productionDays
      estimatedProductionDate
      actualProductionStart
      customerNote
      manufacturerResponse
      createdAt
      collection {
        id
        name
        modelCode
        images
      }
      customer {
        id
        name
        firstName
        lastName
        email
      }
      manufacture {
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
    }
  }
`;

export const PUBLIC_PLATFORM_STATS_QUERY = gql`
  query PublicPlatformStats {
    publicPlatformStats {
      totalProducts
      activeManufacturers
      activeWorkshops
      totalCollections
      totalOrders
      collectionsByGender {
        men
        women
        unisex
      }
      collectionsByCategory {
        category
        count
        men
        women
        unisex
      }
      sustainability {
        carbonFootprintReduction
        recycledMaterialUsage
        certifiedOrganicProducts
        gotsChronumCertified
        waterSavedLiters
      }
      suppliersByCountry {
        country
        count
        companies {
          name
          city
        }
      }
      platformFeatures {
        title
        description
        icon
      }
      recentActivity {
        newCollectionsThisWeek
        completedOrdersThisMonth
        newManufacturersThisMonth
        activeProductionsNow
        latestCollections {
          name
          gender
          createdAt
        }
      }
      testimonials {
        name
        role
        rating
        comment
      }
      growthMetrics {
        monthlyGrowthRate
        totalTransactionVolume
        avgDeliveryDays
        customerSatisfactionRate
      }
    }
  }
`;
