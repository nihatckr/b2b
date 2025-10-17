import { gql } from "urql";

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        firstName
        lastName
        role
        companyId
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      token
      user {
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
        isActive
        createdAt
        updatedAt
        company {
          id
          name
          type
        }
      }
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser(
    $email: String!
    $name: String!
    $password: String!
    $role: Role!
  ) {
    createUser(email: $email, name: $name, password: $password, role: $role) {
      id
      email
      name
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($input: UserUpdateInput!) {
    updateUser(input: $input) {
      id
      email
      name
      firstName
      lastName
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id) {
      id
      email
      name
    }
  }
`;

// Company Mutations
export const CREATE_COMPANY_MUTATION = gql`
  mutation CreateCompany(
    $name: String!
    $email: String!
    $phone: String
    $address: String
    $website: String
    $isActive: Boolean
  ) {
    createCompany(
      name: $name
      email: $email
      phone: $phone
      address: $address
      website: $website
      isActive: $isActive
    ) {
      id
      name
      email
      phone
      address
      website
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_COMPANY_MUTATION = gql`
  mutation UpdateCompany(
    $id: Int!
    $name: String
    $email: String
    $phone: String
    $address: String
    $website: String
    $description: String
    $isActive: Boolean
  ) {
    updateCompany(
      id: $id
      name: $name
      email: $email
      phone: $phone
      address: $address
      website: $website
      isActive: $isActive
    ) {
      id
      name
      email
      phone
      address
      website
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_COMPANY_MUTATION = gql`
  mutation DeleteCompany($id: Int!) {
    deleteCompany(id: $id) {
      id
      name
      email
    }
  }
`;

// Category Mutations
export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory(
    $name: String!
    $description: String
    $parentCategoryId: Int
    $companyId: Int
  ) {
    createCategory(
      name: $name
      description: $description
      parentCategoryId: $parentCategoryId
      companyId: $companyId
    ) {
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
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory(
    $id: Int!
    $name: String
    $description: String
    $parentCategoryId: Int
    $companyId: Int
  ) {
    updateCategory(
      id: $id
      name: $name
      description: $description
      parentCategoryId: $parentCategoryId
      companyId: $companyId
    ) {
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
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($id: Int!) {
    deleteCategory(id: $id) {
      id
      name
    }
  }
`;

// Collection Mutations
export const CREATE_COLLECTION_MUTATION = gql`
  mutation CreateCollection($input: CreateCollectionInput!) {
    createCollection(input: $input) {
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
    }
  }
`;

export const UPDATE_COLLECTION_MUTATION = gql`
  mutation UpdateCollection($input: UpdateCollectionInput!) {
    updateCollection(input: $input) {
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
    }
  }
`;

export const DELETE_COLLECTION_MUTATION = gql`
  mutation DeleteCollection($id: Int!) {
    deleteCollection(id: $id) {
      id
      name
    }
  }
`;

// Sample Mutations
export const CREATE_SAMPLE_MUTATION = gql`
  mutation CreateSample($input: CreateSampleInput!) {
    createSample(input: $input) {
      id
      sampleNumber
      sampleType
      status
      customerNote
      createdAt
      collection {
        id
        name
      }
      manufacture {
        id
        name
      }
      aiAnalysis {
        id
        detectedProduct
        detectedColor
        detectedFabric
        qualityScore
        estimatedCostMin
        estimatedCostMax
        trendScore
        designStyle
      }
    }
  }
`;

export const UPDATE_SAMPLE_MUTATION = gql`
  mutation UpdateSample($input: UpdateSampleInput!) {
    updateSample(input: $input) {
      id
      sampleNumber
      status
      customerNote
      manufacturerResponse
      productionDays
      estimatedProductionDate
      actualProductionDate
      shippingDate
      cargoTrackingNumber
      updatedAt
    }
  }
`;

export const UPDATE_SAMPLE_STATUS_MUTATION = gql`
  mutation UpdateSampleStatus($input: UpdateSampleStatusInput!) {
    updateSampleStatus(input: $input) {
      id
      sampleNumber
      status
      productionDays
      estimatedProductionDate
      actualProductionDate
      updatedAt
    }
  }
`;

export const DELETE_SAMPLE_MUTATION = gql`
  mutation DeleteSample($id: Int!) {
    deleteSample(id: $id) {
      id
      sampleNumber
    }
  }
`;

export const APPROVE_SAMPLE_MUTATION = gql`
  mutation ApproveSample(
    $id: Int!
    $approve: Boolean!
    $manufacturerNote: String
    $estimatedDays: Int
  ) {
    approveSample(
      id: $id
      approve: $approve
      manufacturerNote: $manufacturerNote
      estimatedDays: $estimatedDays
    ) {
      id
      sampleNumber
      status
      manufacturerResponse
      productionDays
      estimatedProductionDate
      updatedAt
    }
  }
`;

export const HOLD_SAMPLE_MUTATION = gql`
  mutation HoldSample($id: Int!, $reason: String) {
    holdSample(id: $id, reason: $reason) {
      id
      sampleNumber
      status
      manufacturerResponse
      updatedAt
    }
  }
`;

export const CANCEL_SAMPLE_MUTATION = gql`
  mutation CancelSample($id: Int!, $reason: String) {
    cancelSample(id: $id, reason: $reason) {
      id
      sampleNumber
      status
      manufacturerResponse
      updatedAt
    }
  }
`;

export const RESUME_SAMPLE_MUTATION = gql`
  mutation ResumeSample($id: Int!, $note: String) {
    resumeSample(id: $id, note: $note) {
      id
      sampleNumber
      status
      updatedAt
    }
  }
`;

// Order Mutations
export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder(
    $collectionId: Int!
    $quantity: Int!
    $unitPrice: Float
    $customerNote: String
    $deliveryAddress: String
    $estimatedDelivery: DateTime
    $manufactureId: Int
    $companyId: Int
  ) {
    createOrder(
      collectionId: $collectionId
      quantity: $quantity
      unitPrice: $unitPrice
      customerNote: $customerNote
      deliveryAddress: $deliveryAddress
      estimatedDelivery: $estimatedDelivery
      manufactureId: $manufactureId
      companyId: $companyId
    ) {
      id
      orderNumber
      status
      quantity
      unitPrice
      totalPrice
      createdAt
      collection {
        id
        name
      }
      manufacture {
        id
        name
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS_MUTATION = gql`
  mutation UpdateOrderStatus(
    $id: Int!
    $status: OrderStatus!
    $note: String
    $estimatedDays: Int
    $quotedPrice: Float
  ) {
    updateOrderStatus(
      id: $id
      status: $status
      note: $note
      estimatedDays: $estimatedDays
      quotedPrice: $quotedPrice
    ) {
      id
      orderNumber
      status
      unitPrice
      totalPrice
      productionDays
      estimatedProductionDate
      updatedAt
    }
  }
`;

export const UPDATE_ORDER_MUTATION = gql`
  mutation UpdateOrder(
    $id: Int!
    $status: OrderStatus
    $manufacturerResponse: String
    $productionDays: Int
    $estimatedProductionDate: DateTime
  ) {
    updateOrder(
      id: $id
      status: $status
      manufacturerResponse: $manufacturerResponse
      productionDays: $productionDays
      estimatedProductionDate: $estimatedProductionDate
    ) {
      id
      status
      manufacturerResponse
      productionDays
      estimatedProductionDate
    }
  }
`;

export const UPDATE_CUSTOMER_ORDER_MUTATION = gql`
  mutation UpdateCustomerOrder(
    $id: Int!
    $quantity: Int
    $unitPrice: Float
    $customerNote: String
    $deliveryAddress: String
  ) {
    updateCustomerOrder(
      id: $id
      quantity: $quantity
      unitPrice: $unitPrice
      customerNote: $customerNote
      deliveryAddress: $deliveryAddress
    ) {
      id
      orderNumber
      status
      quantity
      unitPrice
      totalPrice
      customerNote
      deliveryAddress
      updatedAt
    }
  }
`;

export const CANCEL_ORDER_MUTATION = gql`
  mutation CancelOrder($id: Int!, $reason: String) {
    cancelOrder(id: $id, reason: $reason) {
      id
      orderNumber
      status
      updatedAt
    }
  }
`;

export const DELETE_ORDER_MUTATION = gql`
  mutation DeleteOrder($id: Int!) {
    deleteOrder(id: $id) {
      id
      orderNumber
    }
  }
`;
