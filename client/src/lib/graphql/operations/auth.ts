import { gql } from '@apollo/client';

const LOGIN = gql`
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      name
      email
      role
      isActive
      createdAt
      updatedAt
      firstName
      lastName
      phone
      username
      companyId
    }
  }
}
`;

const SIGNUP = gql`
mutation Signup($input: SignupInput!) {
  signup(input: $input) {
    token
    user {
      id
      name
      email
      role
      isActive
      createdAt
      updatedAt
      firstName
      lastName
      phone
      username
      companyId
    }
  }
}
`;
export const ME = gql`

query Me {
  me {
    id
    name
    email
    role
    isActive
    createdAt
    updatedAt
    firstName
    lastName
    phone
    username
    companyId
  }
}
`;
