import { gql } from "@apollo/client";

export const Login = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        role
        updatedAt
        email
        createdAt
      }
    }
  }
`;
