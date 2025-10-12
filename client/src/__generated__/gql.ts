/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\nmutation Login($input: LoginInput!) {\n  login(input: $input) {\n    token\n    user {\n      id\n      name\n      email\n      role\n      isActive\n      createdAt\n      updatedAt\n      firstName\n      lastName\n      phone\n      username\n      companyId\n    }\n  }\n}\n": typeof types.LoginDocument,
    "\nmutation Signup($input: SignupInput!) {\n  signup(input: $input) {\n    token\n    user {\n      id\n      name\n      email\n      role\n      isActive\n      createdAt\n      updatedAt\n      firstName\n      lastName\n      phone\n      username\n      companyId\n    }\n  }\n}\n": typeof types.SignupDocument,
    "\n\nquery Me {\n  me {\n    id\n    name\n    email\n    role\n    isActive\n    createdAt\n    updatedAt\n    firstName\n    lastName\n    phone\n    username\n    companyId\n  }\n}\n": typeof types.MeDocument,
    "\nquery AllUsers {\n  allUsers {\n    id\n    email\n    role\n    name\n  }\n}\n": typeof types.AllUsersDocument,
};
const documents: Documents = {
    "\nmutation Login($input: LoginInput!) {\n  login(input: $input) {\n    token\n    user {\n      id\n      name\n      email\n      role\n      isActive\n      createdAt\n      updatedAt\n      firstName\n      lastName\n      phone\n      username\n      companyId\n    }\n  }\n}\n": types.LoginDocument,
    "\nmutation Signup($input: SignupInput!) {\n  signup(input: $input) {\n    token\n    user {\n      id\n      name\n      email\n      role\n      isActive\n      createdAt\n      updatedAt\n      firstName\n      lastName\n      phone\n      username\n      companyId\n    }\n  }\n}\n": types.SignupDocument,
    "\n\nquery Me {\n  me {\n    id\n    name\n    email\n    role\n    isActive\n    createdAt\n    updatedAt\n    firstName\n    lastName\n    phone\n    username\n    companyId\n  }\n}\n": types.MeDocument,
    "\nquery AllUsers {\n  allUsers {\n    id\n    email\n    role\n    name\n  }\n}\n": types.AllUsersDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nmutation Login($input: LoginInput!) {\n  login(input: $input) {\n    token\n    user {\n      id\n      name\n      email\n      role\n      isActive\n      createdAt\n      updatedAt\n      firstName\n      lastName\n      phone\n      username\n      companyId\n    }\n  }\n}\n"): (typeof documents)["\nmutation Login($input: LoginInput!) {\n  login(input: $input) {\n    token\n    user {\n      id\n      name\n      email\n      role\n      isActive\n      createdAt\n      updatedAt\n      firstName\n      lastName\n      phone\n      username\n      companyId\n    }\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nmutation Signup($input: SignupInput!) {\n  signup(input: $input) {\n    token\n    user {\n      id\n      name\n      email\n      role\n      isActive\n      createdAt\n      updatedAt\n      firstName\n      lastName\n      phone\n      username\n      companyId\n    }\n  }\n}\n"): (typeof documents)["\nmutation Signup($input: SignupInput!) {\n  signup(input: $input) {\n    token\n    user {\n      id\n      name\n      email\n      role\n      isActive\n      createdAt\n      updatedAt\n      firstName\n      lastName\n      phone\n      username\n      companyId\n    }\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n\nquery Me {\n  me {\n    id\n    name\n    email\n    role\n    isActive\n    createdAt\n    updatedAt\n    firstName\n    lastName\n    phone\n    username\n    companyId\n  }\n}\n"): (typeof documents)["\n\nquery Me {\n  me {\n    id\n    name\n    email\n    role\n    isActive\n    createdAt\n    updatedAt\n    firstName\n    lastName\n    phone\n    username\n    companyId\n  }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery AllUsers {\n  allUsers {\n    id\n    email\n    role\n    name\n  }\n}\n"): (typeof documents)["\nquery AllUsers {\n  allUsers {\n    id\n    email\n    role\n    name\n  }\n}\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;