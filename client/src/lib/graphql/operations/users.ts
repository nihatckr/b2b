import { gql } from '@apollo/client';

const ALL_USERS = gql`
query AllUsers {
  allUsers {
    id
    email
    role
    name
  }
}
`;
