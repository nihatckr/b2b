import { gql } from "@apollo/client";

export const SignUp = gql`
  mutation Signup($email: String!, $password: String!, $name: String) {
    signup(email: $email, password: $password, name: $name) {
      token
      user {
        id
        name
        email
        role
        updatedAt
        createdAt
      }
    }
  }
`;
