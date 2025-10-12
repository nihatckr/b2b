import { gql } from "@apollo/client";

export const Me = gql`
  query Me {
    me {
      createdAt
      email
      id
      name
      role
      updatedAt
    }
  }
`;
