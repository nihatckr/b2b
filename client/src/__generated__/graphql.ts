/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
};

export type AdminPasswordResetInput = {
  newPassword: Scalars['String']['input'];
  requireChangeOnLogin?: InputMaybe<Scalars['Boolean']['input']>;
  userId: Scalars['Int']['input'];
};

export type AdminUserUpdateInput = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Role>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

export type Category = {
  __typename?: 'Category';
  authorId?: Maybe<Scalars['Int']['output']>;
  companyId?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  parentCategoryId?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type Collection = {
  __typename?: 'Collection';
  authorId?: Maybe<Scalars['Int']['output']>;
  categoryId?: Maybe<Scalars['Int']['output']>;
  companyId?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  images?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  isFeatured: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  sku?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  stock: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Company = {
  __typename?: 'Company';
  address?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  rememberMe?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Message = {
  __typename?: 'Message';
  companyId?: Maybe<Scalars['Int']['output']>;
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  isRead: Scalars['Boolean']['output'];
  receiver?: Maybe<Scalars['String']['output']>;
  senderId: Scalars['Int']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  changePassword?: Maybe<Scalars['Boolean']['output']>;
  deleteUser?: Maybe<User>;
  login?: Maybe<AuthPayload>;
  logout?: Maybe<Scalars['Boolean']['output']>;
  resetUserPassword?: Maybe<User>;
  signup?: Maybe<AuthPayload>;
  updateProfile?: Maybe<User>;
  updateUserRole?: Maybe<User>;
};


export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};


export type MutationDeleteUserArgs = {
  userId: Scalars['Int']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationResetUserPasswordArgs = {
  newPassword: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
};


export type MutationSignupArgs = {
  input: SignupInput;
};


export type MutationUpdateProfileArgs = {
  input: UserUpdateInput;
};


export type MutationUpdateUserRoleArgs = {
  role: Role;
  userId: Scalars['Int']['input'];
};

export type Order = {
  __typename?: 'Order';
  actualProductionEnd?: Maybe<Scalars['String']['output']>;
  actualProductionStart?: Maybe<Scalars['String']['output']>;
  cargoTrackingNumber?: Maybe<Scalars['String']['output']>;
  collectionId: Scalars['Int']['output'];
  companyId?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['String']['output'];
  customerId: Scalars['Int']['output'];
  customerNote?: Maybe<Scalars['String']['output']>;
  deliveryAddress?: Maybe<Scalars['String']['output']>;
  estimatedProductionDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  manufactureId: Scalars['Int']['output'];
  manufacturerResponse?: Maybe<Scalars['String']['output']>;
  orderNumber: Scalars['String']['output'];
  productionDays?: Maybe<Scalars['Int']['output']>;
  quantity: Scalars['Int']['output'];
  shippingDate?: Maybe<Scalars['String']['output']>;
  status: OrderStatus;
  totalPrice: Scalars['Float']['output'];
  unitPrice: Scalars['Float']['output'];
  updatedAt: Scalars['String']['output'];
};

export type OrderProduction = {
  __typename?: 'OrderProduction';
  actualDate?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  estimatedDays?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  note?: Maybe<Scalars['String']['output']>;
  orderId: Scalars['Int']['output'];
  status: OrderStatus;
  updatedById: Scalars['Int']['output'];
};

/** Order status tracking */
export enum OrderStatus {
  Cancelled = 'CANCELLED',
  Confirmed = 'CONFIRMED',
  Delivered = 'DELIVERED',
  InProduction = 'IN_PRODUCTION',
  Pending = 'PENDING',
  ProductionComplete = 'PRODUCTION_COMPLETE',
  QualityCheck = 'QUALITY_CHECK',
  QuoteSent = 'QUOTE_SENT',
  Rejected = 'REJECTED',
  Reviewed = 'REVIEWED',
  Shipped = 'SHIPPED'
}

export type PasswordChangeInput = {
  confirmPassword?: InputMaybe<Scalars['String']['input']>;
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type PasswordResetInput = {
  email: Scalars['String']['input'];
  newPassword?: InputMaybe<Scalars['String']['input']>;
  resetToken?: InputMaybe<Scalars['String']['input']>;
};

export type ProductionTracking = {
  __typename?: 'ProductionTracking';
  actualEnd?: Maybe<Scalars['String']['output']>;
  companyId?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['String']['output'];
  estimatedEnd?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  orderId?: Maybe<Scalars['Int']['output']>;
  progress: Scalars['Int']['output'];
  sampleId?: Maybe<Scalars['Int']['output']>;
  stage: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  allUsers: Array<User>;
  me?: Maybe<User>;
  userStats?: Maybe<UserStats>;
};


export type QueryAllUsersArgs = {
  role?: InputMaybe<Role>;
  searchString?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type Question = {
  __typename?: 'Question';
  answer?: Maybe<Scalars['String']['output']>;
  collectionId: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  customerId: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  isAnswered: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  manufactureId: Scalars['Int']['output'];
  question: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Review = {
  __typename?: 'Review';
  collectionId: Scalars['Int']['output'];
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  customerId: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  isApproved: Scalars['Boolean']['output'];
  rating: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Revision = {
  __typename?: 'Revision';
  completedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  orderId?: Maybe<Scalars['Int']['output']>;
  productionTrackingId?: Maybe<Scalars['Int']['output']>;
  requestMessage?: Maybe<Scalars['String']['output']>;
  requestedAt: Scalars['String']['output'];
  responseMessage?: Maybe<Scalars['String']['output']>;
  revisionNumber: Scalars['Int']['output'];
  sampleId?: Maybe<Scalars['Int']['output']>;
  status: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

/** User roles in the system */
export enum Role {
  Admin = 'ADMIN',
  Customer = 'CUSTOMER',
  Manufacture = 'MANUFACTURE'
}

export type Sample = {
  __typename?: 'Sample';
  actualProductionDate?: Maybe<Scalars['String']['output']>;
  cargoTrackingNumber?: Maybe<Scalars['String']['output']>;
  collectionId?: Maybe<Scalars['Int']['output']>;
  companyId?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['String']['output'];
  customDesignImages?: Maybe<Scalars['String']['output']>;
  customerId: Scalars['Int']['output'];
  customerNote?: Maybe<Scalars['String']['output']>;
  deliveryAddress?: Maybe<Scalars['String']['output']>;
  estimatedProductionDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  manufactureId: Scalars['Int']['output'];
  manufacturerResponse?: Maybe<Scalars['String']['output']>;
  originalCollectionId?: Maybe<Scalars['Int']['output']>;
  productionDays?: Maybe<Scalars['Int']['output']>;
  revisionRequests?: Maybe<Scalars['String']['output']>;
  sampleNumber: Scalars['String']['output'];
  sampleType: SampleType;
  shippingDate?: Maybe<Scalars['String']['output']>;
  status: SampleStatus;
  updatedAt: Scalars['String']['output'];
};

export type SampleProduction = {
  __typename?: 'SampleProduction';
  actualDate?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  estimatedDays?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  note?: Maybe<Scalars['String']['output']>;
  sampleId: Scalars['Int']['output'];
  status: SampleStatus;
  updatedById: Scalars['Int']['output'];
};

/** Sample status tracking */
export enum SampleStatus {
  Approved = 'APPROVED',
  Delivered = 'DELIVERED',
  InProduction = 'IN_PRODUCTION',
  ProductionComplete = 'PRODUCTION_COMPLETE',
  QuoteSent = 'QUOTE_SENT',
  Received = 'RECEIVED',
  Rejected = 'REJECTED',
  Requested = 'REQUESTED',
  Reviewed = 'REVIEWED',
  Shipped = 'SHIPPED'
}

/** Sample types in the system */
export enum SampleType {
  Custom = 'CUSTOM',
  Development = 'DEVELOPMENT',
  Revision = 'REVISION',
  Standard = 'STANDARD'
}

export type SignupInput = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  email: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Role>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** Sort order for queries */
export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export type User = {
  __typename?: 'User';
  categories?: Maybe<Array<Maybe<Category>>>;
  collections?: Maybe<Array<Maybe<Collection>>>;
  company?: Maybe<Company>;
  companyId?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['String']['output'];
  customerOrders?: Maybe<Array<Maybe<Order>>>;
  customerQuestions?: Maybe<Array<Maybe<Question>>>;
  customerReviews?: Maybe<Array<Maybe<Review>>>;
  customerSamples?: Maybe<Array<Maybe<Sample>>>;
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  manufactureOrders?: Maybe<Array<Maybe<Order>>>;
  manufactureQuestions?: Maybe<Array<Maybe<Question>>>;
  manufactureSamples?: Maybe<Array<Maybe<Sample>>>;
  name?: Maybe<Scalars['String']['output']>;
  orderProductionUpdates?: Maybe<Array<Maybe<OrderProduction>>>;
  phone?: Maybe<Scalars['String']['output']>;
  role: Role;
  sampleProductionUpdates?: Maybe<Array<Maybe<SampleProduction>>>;
  sentMessages?: Maybe<Array<Maybe<Message>>>;
  updatedAt: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type UserCreateInput = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  email: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Role>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type UserFilterInput = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Role>;
  searchString?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type UserPaginationInput = {
  orderBy?: InputMaybe<UserSortInput>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<UserFilterInput>;
};

export type UserSortInput = {
  createdAt?: InputMaybe<SortOrder>;
  email?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  role?: InputMaybe<SortOrder>;
  updatedAt?: InputMaybe<SortOrder>;
};

export type UserStats = {
  __typename?: 'UserStats';
  adminCount: Scalars['Int']['output'];
  customerCount: Scalars['Int']['output'];
  manufactureCount: Scalars['Int']['output'];
  totalUsers: Scalars['Int']['output'];
};

export type UserUpdateInput = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login?: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: number, name?: string | null, email: string, role: Role, isActive: boolean, createdAt: string, updatedAt: string, firstName?: string | null, lastName?: string | null, phone?: string | null, username?: string | null, companyId?: number | null } } | null };

export type SignupMutationVariables = Exact<{
  input: SignupInput;
}>;


export type SignupMutation = { __typename?: 'Mutation', signup?: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: number, name?: string | null, email: string, role: Role, isActive: boolean, createdAt: string, updatedAt: string, firstName?: string | null, lastName?: string | null, phone?: string | null, username?: string | null, companyId?: number | null } } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, name?: string | null, email: string, role: Role, isActive: boolean, createdAt: string, updatedAt: string, firstName?: string | null, lastName?: string | null, phone?: string | null, username?: string | null, companyId?: number | null } | null };

export type AllUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type AllUsersQuery = { __typename?: 'Query', allUsers: Array<{ __typename?: 'User', id: number, email: string, role: Role, name?: string | null }> };


export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"companyId"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const SignupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Signup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SignupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"companyId"}}]}}]}}]}}]} as unknown as DocumentNode<SignupMutation, SignupMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"companyId"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const AllUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AllUsersQuery, AllUsersQueryVariables>;