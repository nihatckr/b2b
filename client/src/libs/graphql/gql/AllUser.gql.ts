import { gql } from "@apollo/client";

export const AllUser = gql`
  query AllUsers {
    allUsers {
      email
      id
      name
      role
    }
  }
`;
