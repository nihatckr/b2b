import { gql } from "urql";

// ========== COLOR OPERATIONS ==========

export const MY_COLORS_QUERY = gql`
  query MyColors {
    myColors {
      id
      name
      code
      hexCode
      imageUrl
      isActive
      createdAt
    }
  }
`;

export const CREATE_COLOR_MUTATION = gql`
  mutation CreateColor($input: CreateColorInput!) {
    createColor(input: $input) {
      id
      name
      code
      hexCode
    }
  }
`;

export const UPDATE_COLOR_MUTATION = gql`
  mutation UpdateColor($input: UpdateColorInput!) {
    updateColor(input: $input) {
      id
      name
      code
      hexCode
    }
  }
`;

export const DELETE_COLOR_MUTATION = gql`
  mutation DeleteColor($id: Int!) {
    deleteColor(id: $id) {
      id
    }
  }
`;

// ========== FABRIC OPERATIONS ==========

export const MY_FABRICS_QUERY = gql`
  query MyFabrics {
    myFabrics {
      id
      name
      code
      composition
      weight
      width
      supplier
      price
      minOrder
      leadTime
      imageUrl
      description
      isActive
      createdAt
    }
  }
`;

export const CREATE_FABRIC_MUTATION = gql`
  mutation CreateFabric($input: CreateFabricInput!) {
    createFabric(input: $input) {
      id
      name
      code
      composition
    }
  }
`;

export const UPDATE_FABRIC_MUTATION = gql`
  mutation UpdateFabric($input: UpdateFabricInput!) {
    updateFabric(input: $input) {
      id
      name
      code
      composition
    }
  }
`;

export const DELETE_FABRIC_MUTATION = gql`
  mutation DeleteFabric($id: Int!) {
    deleteFabric(id: $id) {
      id
    }
  }
`;

// ========== SIZE GROUP OPERATIONS ==========

export const MY_SIZE_GROUPS_QUERY = gql`
  query MySizeGroups {
    mySizeGroups {
      id
      name
      category
      sizes
      description
      isActive
      createdAt
    }
  }
`;

export const CREATE_SIZE_GROUP_MUTATION = gql`
  mutation CreateSizeGroup($input: CreateSizeGroupInput!) {
    createSizeGroup(input: $input) {
      id
      name
      sizes
    }
  }
`;

export const UPDATE_SIZE_GROUP_MUTATION = gql`
  mutation UpdateSizeGroup($input: UpdateSizeGroupInput!) {
    updateSizeGroup(input: $input) {
      id
      name
      sizes
    }
  }
`;

export const DELETE_SIZE_GROUP_MUTATION = gql`
  mutation DeleteSizeGroup($id: Int!) {
    deleteSizeGroup(id: $id) {
      id
    }
  }
`;

// ========== SEASON OPERATIONS ==========

export const MY_SEASONS_QUERY = gql`
  query MySeasons {
    mySeasons {
      id
      name
      fullName
      year
      type
      startDate
      endDate
      description
      isActive
      companyId
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_SEASON_MUTATION = gql`
  mutation CreateSeason(
    $name: String!
    $fullName: String!
    $year: Int!
    $type: String!
    $startDate: DateTime
    $endDate: DateTime
    $description: String
  ) {
    createSeason(
      name: $name
      fullName: $fullName
      year: $year
      type: $type
      startDate: $startDate
      endDate: $endDate
      description: $description
    ) {
      id
      name
      fullName
    }
  }
`;

export const UPDATE_SEASON_MUTATION = gql`
  mutation UpdateSeason(
    $id: Int!
    $name: String
    $fullName: String
    $year: Int
    $type: String
    $startDate: DateTime
    $endDate: DateTime
    $description: String
    $isActive: Boolean
  ) {
    updateSeason(
      id: $id
      name: $name
      fullName: $fullName
      year: $year
      type: $type
      startDate: $startDate
      endDate: $endDate
      description: $description
      isActive: $isActive
    ) {
      id
      name
      fullName
    }
  }
`;

export const DELETE_SEASON_MUTATION = gql`
  mutation DeleteSeason($id: Int!) {
    deleteSeason(id: $id) {
      id
    }
  }
`;

// ========== FIT OPERATIONS ==========

export const MY_FITS_QUERY = gql`
  query MyFits {
    myFits {
      id
      name
      code
      category
      description
      isActive
      companyId
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_FIT_MUTATION = gql`
  mutation CreateFit(
    $name: String!
    $code: String
    $category: String
    $description: String
  ) {
    createFit(
      name: $name
      code: $code
      category: $category
      description: $description
    ) {
      id
      name
      code
    }
  }
`;

export const UPDATE_FIT_MUTATION = gql`
  mutation UpdateFit(
    $id: Int!
    $name: String
    $code: String
    $category: String
    $description: String
    $isActive: Boolean
  ) {
    updateFit(
      id: $id
      name: $name
      code: $code
      category: $category
      description: $description
      isActive: $isActive
    ) {
      id
      name
      code
    }
  }
`;

export const DELETE_FIT_MUTATION = gql`
  mutation DeleteFit($id: Int!) {
    deleteFit(id: $id) {
      id
    }
  }
`;
