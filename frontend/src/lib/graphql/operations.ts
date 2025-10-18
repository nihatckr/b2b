import { gql } from "urql";

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      role
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;
