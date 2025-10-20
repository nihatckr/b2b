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
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
  File: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type AiAnalysis = {
  __typename?: 'AIAnalysis';
  costAnalysis?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  designFocus?: Maybe<Scalars['String']['output']>;
  designStyle?: Maybe<Scalars['String']['output']>;
  designSuggestions?: Maybe<Scalars['String']['output']>;
  detectedAccessories?: Maybe<Scalars['String']['output']>;
  detectedClassification?: Maybe<Scalars['String']['output']>;
  detectedColor?: Maybe<Scalars['String']['output']>;
  detectedFabric?: Maybe<Scalars['String']['output']>;
  detectedGender?: Maybe<Scalars['String']['output']>;
  detectedPattern?: Maybe<Scalars['String']['output']>;
  detectedProduct?: Maybe<Scalars['String']['output']>;
  estimatedCostMax?: Maybe<Scalars['Float']['output']>;
  estimatedCostMin?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  qualityAnalysis?: Maybe<Scalars['String']['output']>;
  qualityScore?: Maybe<Scalars['Float']['output']>;
  salesPotential?: Maybe<Scalars['String']['output']>;
  sample?: Maybe<Sample>;
  sampleId?: Maybe<Scalars['Int']['output']>;
  suggestedMinOrder?: Maybe<Scalars['Int']['output']>;
  targetMarket?: Maybe<Scalars['String']['output']>;
  technicalDescription?: Maybe<Scalars['String']['output']>;
  trendAnalysis?: Maybe<Scalars['String']['output']>;
  trendScore?: Maybe<Scalars['Float']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum BillingCycle {
  Monthly = 'MONTHLY',
  Yearly = 'YEARLY'
}

export type Category = {
  __typename?: 'Category';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum CategoryLevel {
  Detail = 'DETAIL',
  Main = 'MAIN',
  Root = 'ROOT',
  Sub = 'SUB'
}

export enum CategoryType {
  CompanyCustom = 'COMPANY_CUSTOM',
  GlobalStandard = 'GLOBAL_STANDARD'
}

export type Collection = Node & {
  __typename?: 'Collection';
  accessories?: Maybe<Scalars['String']['output']>;
  author?: Maybe<User>;
  authorId?: Maybe<Scalars['Int']['output']>;
  category?: Maybe<Category>;
  categoryId?: Maybe<Scalars['Int']['output']>;
  certifications?: Maybe<Array<LibraryItem>>;
  colors?: Maybe<Scalars['String']['output']>;
  company?: Maybe<Company>;
  companyCategory?: Maybe<CompanyCategory>;
  companyCategoryId?: Maybe<Scalars['Int']['output']>;
  companyId?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fabricComposition?: Maybe<Scalars['String']['output']>;
  fit?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  images?: Maybe<Scalars['String']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isFeatured?: Maybe<Scalars['Boolean']['output']>;
  lastViewedAt?: Maybe<Scalars['DateTime']['output']>;
  likesCount?: Maybe<Scalars['Int']['output']>;
  mainImage?: Maybe<Scalars['String']['output']>;
  measurementChart?: Maybe<Scalars['String']['output']>;
  modelCode?: Maybe<Scalars['String']['output']>;
  moq?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  orders?: Maybe<Array<Order>>;
  price?: Maybe<Scalars['Float']['output']>;
  productionSchedule?: Maybe<Scalars['String']['output']>;
  samples?: Maybe<Array<Sample>>;
  season?: Maybe<Scalars['String']['output']>;
  shareCount?: Maybe<Scalars['Int']['output']>;
  sizeGroups?: Maybe<Scalars['String']['output']>;
  sizeRange?: Maybe<Scalars['String']['output']>;
  sku?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  stock?: Maybe<Scalars['Int']['output']>;
  targetLeadTime?: Maybe<Scalars['Int']['output']>;
  targetPrice?: Maybe<Scalars['Float']['output']>;
  techPack?: Maybe<Scalars['String']['output']>;
  trend?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  viewCount?: Maybe<Scalars['Int']['output']>;
};

export type Company = Node & {
  __typename?: 'Company';
  address?: Maybe<Scalars['String']['output']>;
  billingAddress?: Maybe<Scalars['String']['output']>;
  billingCycle?: Maybe<Scalars['String']['output']>;
  billingEmail?: Maybe<Scalars['String']['output']>;
  brandColors?: Maybe<Scalars['String']['output']>;
  cancelAtPeriodEnd?: Maybe<Scalars['Boolean']['output']>;
  cancelledAt?: Maybe<Scalars['DateTime']['output']>;
  categoriesConnection?: Maybe<CompanyCategoriesConnection>;
  city?: Maybe<Scalars['String']['output']>;
  collectionsConnection?: Maybe<CompanyCollectionsConnection>;
  companyCategoriesConnection?: Maybe<CompanyCompanyCategoriesConnection>;
  country?: Maybe<Scalars['String']['output']>;
  coverImage?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  currentCollections?: Maybe<Scalars['Int']['output']>;
  currentOrders?: Maybe<Scalars['Int']['output']>;
  currentPeriodEnd?: Maybe<Scalars['DateTime']['output']>;
  currentPeriodStart?: Maybe<Scalars['DateTime']['output']>;
  currentSamples?: Maybe<Scalars['Int']['output']>;
  currentStorageGB?: Maybe<Scalars['Float']['output']>;
  currentUsers?: Maybe<Scalars['Int']['output']>;
  defaultView?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  employees?: Maybe<Array<User>>;
  employeesConnection?: Maybe<CompanyEmployeesConnection>;
  enabledModules?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isPublicProfile?: Maybe<Scalars['Boolean']['output']>;
  libraryItemsConnection?: Maybe<CompanyLibraryItemsConnection>;
  location?: Maybe<Scalars['String']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  maxCollections?: Maybe<Scalars['Int']['output']>;
  maxOrders?: Maybe<Scalars['Int']['output']>;
  maxSamples?: Maybe<Scalars['Int']['output']>;
  maxStorageGB?: Maybe<Scalars['Float']['output']>;
  maxUsers?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  ordersConnection?: Maybe<CompanyOrdersConnection>;
  owner?: Maybe<User>;
  ownerId?: Maybe<Scalars['Int']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  profileSlug?: Maybe<Scalars['String']['output']>;
  samplesConnection?: Maybe<CompanySamplesConnection>;
  settings?: Maybe<Scalars['String']['output']>;
  socialLinks?: Maybe<Scalars['String']['output']>;
  subscriptionPlan?: Maybe<Scalars['String']['output']>;
  subscriptionStartedAt?: Maybe<Scalars['DateTime']['output']>;
  subscriptionStatus?: Maybe<Scalars['String']['output']>;
  taxId?: Maybe<Scalars['String']['output']>;
  trialEndsAt?: Maybe<Scalars['DateTime']['output']>;
  trialStartedAt?: Maybe<Scalars['DateTime']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};


export type CompanyCategoriesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type CompanyCollectionsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type CompanyCompanyCategoriesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type CompanyEmployeesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type CompanyLibraryItemsConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type CompanyOrdersConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type CompanySamplesConnectionArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type CompanyCategoriesConnection = {
  __typename?: 'CompanyCategoriesConnection';
  edges?: Maybe<Array<Maybe<CompanyCategoriesConnectionEdge>>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CompanyCategoriesConnectionEdge = {
  __typename?: 'CompanyCategoriesConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Category>;
};

export type CompanyCategory = {
  __typename?: 'CompanyCategory';
  author?: Maybe<User>;
  authorId?: Maybe<Scalars['Int']['output']>;
  company?: Maybe<Company>;
  companyId?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  customFields?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  internalCode?: Maybe<Scalars['String']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  lastUsedAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
  parentCategory?: Maybe<CompanyCategory>;
  parentId?: Maybe<Scalars['Int']['output']>;
  productCount?: Maybe<Scalars['Int']['output']>;
  standardCategory?: Maybe<StandardCategory>;
  standardCategoryId?: Maybe<Scalars['Int']['output']>;
  subCategories?: Maybe<Array<CompanyCategory>>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type CompanyCollectionsConnection = {
  __typename?: 'CompanyCollectionsConnection';
  edges?: Maybe<Array<Maybe<CompanyCollectionsConnectionEdge>>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CompanyCollectionsConnectionEdge = {
  __typename?: 'CompanyCollectionsConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Collection>;
};

export type CompanyCompanyCategoriesConnection = {
  __typename?: 'CompanyCompanyCategoriesConnection';
  edges?: Maybe<Array<Maybe<CompanyCompanyCategoriesConnectionEdge>>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CompanyCompanyCategoriesConnectionEdge = {
  __typename?: 'CompanyCompanyCategoriesConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<CompanyCategory>;
};

export type CompanyEmployeesConnection = {
  __typename?: 'CompanyEmployeesConnection';
  edges?: Maybe<Array<Maybe<CompanyEmployeesConnectionEdge>>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CompanyEmployeesConnectionEdge = {
  __typename?: 'CompanyEmployeesConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<User>;
};

export type CompanyLibraryItemsConnection = {
  __typename?: 'CompanyLibraryItemsConnection';
  edges?: Maybe<Array<Maybe<CompanyLibraryItemsConnectionEdge>>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CompanyLibraryItemsConnectionEdge = {
  __typename?: 'CompanyLibraryItemsConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<LibraryItem>;
};

export type CompanyOrdersConnection = {
  __typename?: 'CompanyOrdersConnection';
  edges?: Maybe<Array<Maybe<CompanyOrdersConnectionEdge>>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CompanyOrdersConnectionEdge = {
  __typename?: 'CompanyOrdersConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Order>;
};

export type CompanySamplesConnection = {
  __typename?: 'CompanySamplesConnection';
  edges?: Maybe<Array<Maybe<CompanySamplesConnectionEdge>>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CompanySamplesConnectionEdge = {
  __typename?: 'CompanySamplesConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Sample>;
};

export enum CompanyType {
  Both = 'BOTH',
  Buyer = 'BUYER',
  Manufacturer = 'MANUFACTURER'
}

export type CreateCompanyCategoryInput = {
  customFields?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  internalCode?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  standardCategoryId?: InputMaybe<Scalars['Int']['input']>;
  type: Scalars['String']['input'];
};

export type CreateLibraryItemInput = {
  category: Scalars['String']['input'];
  code?: InputMaybe<Scalars['String']['input']>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
  data?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  internalCode?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isPopular?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  scope: Scalars['String']['input'];
  standardItemId?: InputMaybe<Scalars['Int']['input']>;
  tags?: InputMaybe<Scalars['String']['input']>;
};

export type CreateStandardCategoryInput = {
  code: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  keywords?: InputMaybe<Scalars['String']['input']>;
  level: Scalars['String']['input'];
  name: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['Int']['input']>;
  tags?: InputMaybe<Scalars['String']['input']>;
};

export enum Department {
  Design = 'DESIGN',
  Management = 'MANAGEMENT',
  Production = 'PRODUCTION',
  Purchasing = 'PURCHASING',
  Quality = 'QUALITY',
  Sales = 'SALES'
}

export enum Fit {
  Fitted = 'FITTED',
  Loose = 'LOOSE',
  Oversized = 'OVERSIZED',
  Regular = 'REGULAR',
  Relaxed = 'RELAXED',
  Slim = 'SLIM'
}

export enum Gender {
  Boys = 'BOYS',
  Girls = 'GIRLS',
  Men = 'MEN',
  Unisex = 'UNISEX',
  Women = 'WOMEN'
}

export enum LibraryCategory {
  Certification = 'CERTIFICATION',
  Color = 'COLOR',
  Fabric = 'FABRIC',
  Fit = 'FIT',
  Material = 'MATERIAL',
  Season = 'SEASON',
  SizeGroup = 'SIZE_GROUP'
}

export type LibraryFilterInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isPopular?: InputMaybe<Scalars['Boolean']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type LibraryItem = {
  __typename?: 'LibraryItem';
  category?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  company?: Maybe<Company>;
  companyId?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdBy?: Maybe<User>;
  createdById?: Maybe<Scalars['Int']['output']>;
  data?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  internalCode?: Maybe<Scalars['String']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isPopular?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  scope?: Maybe<Scalars['String']['output']>;
  standardItem?: Maybe<LibraryItem>;
  standardItemId?: Maybe<Scalars['Int']['output']>;
  tags?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum LibraryScope {
  CompanyCustom = 'COMPANY_CUSTOM',
  PlatformStandard = 'PLATFORM_STANDARD'
}

export type Message = {
  __typename?: 'Message';
  content?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  senderId?: Maybe<Scalars['Int']['output']>;
};

/** Root Mutation */
export type Mutation = {
  __typename?: 'Mutation';
  addProductionStageUpdate?: Maybe<ProductionStageUpdate>;
  analyzeProductWithOllama?: Maybe<Scalars['JSON']['output']>;
  answerQuestion?: Maybe<Question>;
  approveReview?: Maybe<Review>;
  approveSample?: Maybe<Sample>;
  askQuestion?: Maybe<Question>;
  assignWorkshopToProduction?: Maybe<ProductionTracking>;
  bulkDeleteUsersByAdmin?: Maybe<Scalars['JSON']['output']>;
  bulkToggleUserStatus?: Maybe<Scalars['JSON']['output']>;
  cancelOrder?: Maybe<Order>;
  cancelSample?: Maybe<Sample>;
  changePassword?: Maybe<Scalars['Boolean']['output']>;
  checkOllamaStatus?: Maybe<Scalars['JSON']['output']>;
  completeProductionStage?: Maybe<ProductionTracking>;
  completeTask?: Maybe<Task>;
  createCategory?: Maybe<Category>;
  createCollection?: Maybe<Collection>;
  createCompany?: Maybe<Company>;
  createCompanyCategory?: Maybe<CompanyCategory>;
  createLibraryItem?: Maybe<LibraryItem>;
  createOrder?: Maybe<Order>;
  createReview?: Maybe<Review>;
  createSample?: Maybe<Sample>;
  createStandardCategory?: Maybe<StandardCategory>;
  createTask?: Maybe<Task>;
  createUserByAdmin?: Maybe<User>;
  createWorkshop?: Maybe<Workshop>;
  deleteCategory?: Maybe<Scalars['Boolean']['output']>;
  deleteCollection?: Maybe<Scalars['Boolean']['output']>;
  deleteFile?: Maybe<Scalars['Boolean']['output']>;
  deleteLibraryItem?: Maybe<Scalars['Boolean']['output']>;
  deleteMessage?: Maybe<Scalars['Boolean']['output']>;
  deleteOrder?: Maybe<Scalars['Boolean']['output']>;
  deleteQuestion?: Maybe<Scalars['Boolean']['output']>;
  deleteReview?: Maybe<Scalars['Boolean']['output']>;
  deleteSample?: Maybe<Scalars['Boolean']['output']>;
  deleteTask?: Maybe<Scalars['Boolean']['output']>;
  deleteUserByAdmin?: Maybe<Scalars['Boolean']['output']>;
  deleteWorkshop?: Maybe<Workshop>;
  generateDesignFromText?: Maybe<Sample>;
  generateSampleDesign?: Maybe<Sample>;
  holdSample?: Maybe<Sample>;
  likeCollection?: Maybe<UserFavoriteCollection>;
  login?: Maybe<Scalars['JSON']['output']>;
  logout?: Maybe<Scalars['Boolean']['output']>;
  markAllNotificationsAsRead?: Maybe<Scalars['Int']['output']>;
  markNotificationAsRead?: Maybe<Notification>;
  multipleUpload?: Maybe<Scalars['JSON']['output']>;
  publishCollection?: Maybe<Scalars['Boolean']['output']>;
  /** Refresh authentication token for the current user */
  refreshToken?: Maybe<Scalars['String']['output']>;
  register?: Maybe<Scalars['JSON']['output']>;
  requestPasswordReset?: Maybe<Scalars['JSON']['output']>;
  resendVerificationEmail?: Maybe<Scalars['JSON']['output']>;
  resetPassword?: Maybe<Scalars['JSON']['output']>;
  resetUserPassword?: Maybe<User>;
  resumeSample?: Maybe<Sample>;
  revertProductionStage?: Maybe<ProductionTracking>;
  sendMessage?: Maybe<Message>;
  signup?: Maybe<Scalars['JSON']['output']>;
  signupOAuth?: Maybe<Scalars['JSON']['output']>;
  singleUpload?: Maybe<Scalars['JSON']['output']>;
  toggleUserStatusByAdmin?: Maybe<User>;
  unlikeCollection?: Maybe<UserFavoriteCollection>;
  updateCategory?: Maybe<Category>;
  updateCollection?: Maybe<Collection>;
  updateCompany?: Maybe<Company>;
  updateCustomerOrder?: Maybe<Order>;
  updateLibraryItem?: Maybe<LibraryItem>;
  updateOrder?: Maybe<Order>;
  updateOrderStatus?: Maybe<Order>;
  updateProductionStage?: Maybe<ProductionTracking>;
  updateProfile?: Maybe<User>;
  updateReview?: Maybe<Review>;
  updateSample?: Maybe<Sample>;
  updateSampleStatus?: Maybe<Sample>;
  updateTask?: Maybe<Task>;
  updateUser?: Maybe<User>;
  updateUserCompanyByAdmin?: Maybe<User>;
  updateUserRole?: Maybe<User>;
  updateWorkshop?: Maybe<Workshop>;
  uploadFile?: Maybe<Scalars['JSON']['output']>;
  verifyEmail?: Maybe<Scalars['JSON']['output']>;
};


/** Root Mutation */
export type MutationAddProductionStageUpdateArgs = {
  delayReason?: InputMaybe<Scalars['String']['input']>;
  extraDays?: InputMaybe<Scalars['Int']['input']>;
  hasDelay: Scalars['Boolean']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  photos?: InputMaybe<Scalars['String']['input']>;
  productionId: Scalars['Int']['input'];
  stage: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationAnalyzeProductWithOllamaArgs = {
  imageUrl: Scalars['String']['input'];
  sampleId?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Mutation */
export type MutationAnswerQuestionArgs = {
  answer: Scalars['String']['input'];
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationApproveReviewArgs = {
  id: Scalars['Int']['input'];
  isApproved: Scalars['Boolean']['input'];
};


/** Root Mutation */
export type MutationApproveSampleArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationAskQuestionArgs = {
  collectionId: Scalars['Int']['input'];
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  question: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationAssignWorkshopToProductionArgs = {
  packagingWorkshopId?: InputMaybe<Scalars['Int']['input']>;
  productionId: Scalars['Int']['input'];
  sewingWorkshopId?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Mutation */
export type MutationBulkDeleteUsersByAdminArgs = {
  userIds: Array<Scalars['Int']['input']>;
};


/** Root Mutation */
export type MutationBulkToggleUserStatusArgs = {
  isActive: Scalars['Boolean']['input'];
  userIds: Array<Scalars['Int']['input']>;
};


/** Root Mutation */
export type MutationCancelOrderArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationCancelSampleArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationChangePasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationCompleteProductionStageArgs = {
  productionId: Scalars['Int']['input'];
  stage: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationCompleteTaskArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationCreateCategoryArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentCategoryId?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Mutation */
export type MutationCreateCollectionArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  fit?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Scalars['String']['input']>;
  mainImage?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  season?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationCreateCompanyArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationCreateCompanyCategoryArgs = {
  input: CreateCompanyCategoryInput;
};


/** Root Mutation */
export type MutationCreateLibraryItemArgs = {
  input: CreateLibraryItemInput;
};


/** Root Mutation */
export type MutationCreateOrderArgs = {
  collectionId: Scalars['Int']['input'];
  manufacturerId: Scalars['Int']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  quantity: Scalars['Int']['input'];
  unitPrice: Scalars['Float']['input'];
};


/** Root Mutation */
export type MutationCreateReviewArgs = {
  collectionId: Scalars['Int']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  rating: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationCreateSampleArgs = {
  aiGenerated?: InputMaybe<Scalars['Boolean']['input']>;
  aiPrompt?: InputMaybe<Scalars['String']['input']>;
  aiSketchUrl?: InputMaybe<Scalars['String']['input']>;
  collectionId?: InputMaybe<Scalars['Int']['input']>;
  customDesignImages?: InputMaybe<Scalars['String']['input']>;
  customerNote?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Scalars['String']['input']>;
  manufacturerId: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  sampleType?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationCreateStandardCategoryArgs = {
  input: CreateStandardCategoryInput;
};


/** Root Mutation */
export type MutationCreateTaskArgs = {
  collectionId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  orderId?: InputMaybe<Scalars['Int']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  productionTrackingId?: InputMaybe<Scalars['Int']['input']>;
  relatedStatus?: InputMaybe<Scalars['String']['input']>;
  sampleId?: InputMaybe<Scalars['Int']['input']>;
  targetStatus?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  type: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationCreateUserByAdminArgs = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationCreateWorkshopArgs = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationDeleteCategoryArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteCollectionArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteFileArgs = {
  fileId: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationDeleteLibraryItemArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteMessageArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteOrderArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteQuestionArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteReviewArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteSampleArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteTaskArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteUserByAdminArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteWorkshopArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationGenerateDesignFromTextArgs = {
  collectionId?: InputMaybe<Scalars['Int']['input']>;
  negativePrompt?: InputMaybe<Scalars['String']['input']>;
  prompt: Scalars['String']['input'];
  sampleName?: InputMaybe<Scalars['String']['input']>;
  style?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationGenerateSampleDesignArgs = {
  collectionId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  negativePrompt?: InputMaybe<Scalars['String']['input']>;
  prompt: Scalars['String']['input'];
  sampleName?: InputMaybe<Scalars['String']['input']>;
  sketchUrl: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationHoldSampleArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationLikeCollectionArgs = {
  collectionId: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationMarkNotificationAsReadArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationMultipleUploadArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  files: Array<Scalars['File']['input']>;
};


/** Root Mutation */
export type MutationPublishCollectionArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationRequestPasswordResetArgs = {
  email: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationResetPasswordArgs = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationResetUserPasswordArgs = {
  newPassword: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationResumeSampleArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationRevertProductionStageArgs = {
  productionId: Scalars['Int']['input'];
  targetStage: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationSendMessageArgs = {
  content: Scalars['String']['input'];
  orderId?: InputMaybe<Scalars['Int']['input']>;
  recipientId?: InputMaybe<Scalars['Int']['input']>;
  sampleId?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Mutation */
export type MutationSignupArgs = {
  input: SignupInput;
};


/** Root Mutation */
export type MutationSignupOAuthArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationSingleUploadArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  file: Scalars['File']['input'];
};


/** Root Mutation */
export type MutationToggleUserStatusByAdminArgs = {
  isActive: Scalars['Boolean']['input'];
  userId: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationUnlikeCollectionArgs = {
  collectionId: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationUpdateCategoryArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationUpdateCollectionArgs = {
  accessories?: InputMaybe<Scalars['String']['input']>;
  colors?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  fabricComposition?: InputMaybe<Scalars['String']['input']>;
  fit?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  images?: InputMaybe<Scalars['String']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  mainImage?: InputMaybe<Scalars['String']['input']>;
  measurementChart?: InputMaybe<Scalars['String']['input']>;
  moq?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  productionSchedule?: InputMaybe<Scalars['String']['input']>;
  season?: InputMaybe<Scalars['String']['input']>;
  sizeGroups?: InputMaybe<Scalars['String']['input']>;
  sizeRange?: InputMaybe<Scalars['String']['input']>;
  targetLeadTime?: InputMaybe<Scalars['Int']['input']>;
  targetPrice?: InputMaybe<Scalars['Float']['input']>;
  techPack?: InputMaybe<Scalars['String']['input']>;
  trend?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationUpdateCompanyArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  billingCycle?: InputMaybe<Scalars['String']['input']>;
  brandColors?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  coverImage?: InputMaybe<Scalars['String']['input']>;
  defaultView?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  enabledModules?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  isPublicProfile?: InputMaybe<Scalars['Boolean']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  maxProducts?: InputMaybe<Scalars['Int']['input']>;
  maxStorage?: InputMaybe<Scalars['Int']['input']>;
  maxUsers?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  profileSlug?: InputMaybe<Scalars['String']['input']>;
  socialLinks?: InputMaybe<Scalars['String']['input']>;
  subscriptionEndDate?: InputMaybe<Scalars['String']['input']>;
  subscriptionPlan?: InputMaybe<Scalars['String']['input']>;
  subscriptionStartDate?: InputMaybe<Scalars['String']['input']>;
  subscriptionStatus?: InputMaybe<Scalars['String']['input']>;
  trialEndDate?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationUpdateCustomerOrderArgs = {
  id: Scalars['Int']['input'];
  quoteDays?: InputMaybe<Scalars['Int']['input']>;
  quoteNote?: InputMaybe<Scalars['String']['input']>;
  quoteType?: InputMaybe<Scalars['String']['input']>;
  quotedPrice?: InputMaybe<Scalars['Float']['input']>;
};


/** Root Mutation */
export type MutationUpdateLibraryItemArgs = {
  id: Scalars['Int']['input'];
  input: UpdateLibraryItemInput;
};


/** Root Mutation */
export type MutationUpdateOrderArgs = {
  actualProductionEnd?: InputMaybe<Scalars['String']['input']>;
  actualProductionStart?: InputMaybe<Scalars['String']['input']>;
  cargoTrackingNumber?: InputMaybe<Scalars['String']['input']>;
  customerNote?: InputMaybe<Scalars['String']['input']>;
  customerQuoteDays?: InputMaybe<Scalars['Int']['input']>;
  customerQuoteNote?: InputMaybe<Scalars['String']['input']>;
  customerQuotedPrice?: InputMaybe<Scalars['Float']['input']>;
  deliveryAddress?: InputMaybe<Scalars['String']['input']>;
  estimatedProductionDate?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  manufacturerResponse?: InputMaybe<Scalars['String']['input']>;
  productionDays?: InputMaybe<Scalars['Int']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  shippingDate?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  unitPrice?: InputMaybe<Scalars['Float']['input']>;
};


/** Root Mutation */
export type MutationUpdateOrderStatusArgs = {
  id: Scalars['Int']['input'];
  status: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationUpdateProductionStageArgs = {
  notes?: InputMaybe<Scalars['String']['input']>;
  productionId: Scalars['Int']['input'];
  stage: Scalars['String']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationUpdateProfileArgs = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  customAvatar?: InputMaybe<Scalars['String']['input']>;
  department?: InputMaybe<Scalars['String']['input']>;
  emailNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  jobTitle?: InputMaybe<Scalars['String']['input']>;
  language?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  pushNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  socialLinks?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationUpdateReviewArgs = {
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  rating?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Mutation */
export type MutationUpdateSampleArgs = {
  aiPrompt?: InputMaybe<Scalars['String']['input']>;
  aiSketchUrl?: InputMaybe<Scalars['String']['input']>;
  customDesignImages?: InputMaybe<Scalars['String']['input']>;
  customerNote?: InputMaybe<Scalars['String']['input']>;
  customerQuoteDays?: InputMaybe<Scalars['Int']['input']>;
  customerQuoteNote?: InputMaybe<Scalars['String']['input']>;
  customerQuotedPrice?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  images?: InputMaybe<Scalars['String']['input']>;
  manufacturerResponse?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  productionDays?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  unitPrice?: InputMaybe<Scalars['Float']['input']>;
};


/** Root Mutation */
export type MutationUpdateSampleStatusArgs = {
  id: Scalars['Int']['input'];
  status: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationUpdateTaskArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  priority?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationUpdateUserArgs = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
  department?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emailNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['Int']['input'];
  jobTitle?: InputMaybe<Scalars['String']['input']>;
  language?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  pushNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  socialLinks?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationUpdateUserCompanyByAdminArgs = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationUpdateUserRoleArgs = {
  role: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationUpdateWorkshopArgs = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['Int']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationUploadFileArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  filename: Scalars['String']['input'];
  mimetype: Scalars['String']['input'];
  path: Scalars['String']['input'];
  size: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationVerifyEmailArgs = {
  token: Scalars['String']['input'];
};

export type Node = {
  id: Scalars['ID']['output'];
};

export type Notification = {
  __typename?: 'Notification';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isRead?: Maybe<Scalars['Boolean']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

export type NotificationEvent = {
  __typename?: 'NotificationEvent';
  actionUrl?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  isRead?: Maybe<Scalars['Boolean']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  relatedEntityId?: Maybe<Scalars['Int']['output']>;
  relatedEntityType?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['Int']['output']>;
};

export type NotificationReadEvent = {
  __typename?: 'NotificationReadEvent';
  isRead?: Maybe<Scalars['Boolean']['output']>;
  notificationId?: Maybe<Scalars['Int']['output']>;
};

export enum NotificationType {
  Message = 'MESSAGE',
  Order = 'ORDER',
  Production = 'PRODUCTION',
  Quality = 'QUALITY',
  Sample = 'SAMPLE',
  System = 'SYSTEM'
}

export type Order = Node & {
  __typename?: 'Order';
  actualProductionEnd?: Maybe<Scalars['DateTime']['output']>;
  actualProductionStart?: Maybe<Scalars['DateTime']['output']>;
  cargoTrackingNumber?: Maybe<Scalars['String']['output']>;
  collection?: Maybe<Collection>;
  collectionId?: Maybe<Scalars['Int']['output']>;
  company?: Maybe<Company>;
  companyId?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  customer?: Maybe<User>;
  customerId?: Maybe<Scalars['Int']['output']>;
  customerNote?: Maybe<Scalars['String']['output']>;
  customerQuoteDays?: Maybe<Scalars['Int']['output']>;
  customerQuoteNote?: Maybe<Scalars['String']['output']>;
  customerQuotedPrice?: Maybe<Scalars['Float']['output']>;
  deliveryAddress?: Maybe<Scalars['String']['output']>;
  estimatedProductionDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  manufacture?: Maybe<User>;
  manufactureId?: Maybe<Scalars['Int']['output']>;
  manufacturerResponse?: Maybe<Scalars['String']['output']>;
  orderNumber?: Maybe<Scalars['String']['output']>;
  productionDays?: Maybe<Scalars['Int']['output']>;
  quantity?: Maybe<Scalars['Int']['output']>;
  shippingDate?: Maybe<Scalars['DateTime']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  totalPrice?: Maybe<Scalars['Float']['output']>;
  unitPrice?: Maybe<Scalars['Float']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type OrderProduction = {
  __typename?: 'OrderProduction';
  actualDate?: Maybe<Scalars['DateTime']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  estimatedDays?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Order>;
  orderId?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<User>;
  updatedById?: Maybe<Scalars['Int']['output']>;
};

export enum OrderStatus {
  Cancelled = 'CANCELLED',
  Confirmed = 'CONFIRMED',
  CustomerQuoteSent = 'CUSTOMER_QUOTE_SENT',
  Delivered = 'DELIVERED',
  InProduction = 'IN_PRODUCTION',
  ManufacturerReviewingQuote = 'MANUFACTURER_REVIEWING_QUOTE',
  Pending = 'PENDING',
  ProductionComplete = 'PRODUCTION_COMPLETE',
  QualityCheck = 'QUALITY_CHECK',
  QuoteSent = 'QUOTE_SENT',
  Rejected = 'REJECTED',
  RejectedByCustomer = 'REJECTED_BY_CUSTOMER',
  RejectedByManufacturer = 'REJECTED_BY_MANUFACTURER',
  Reviewed = 'REVIEWED',
  Shipped = 'SHIPPED'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum PartnershipStatus {
  Active = 'ACTIVE',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Suspended = 'SUSPENDED',
  Terminated = 'TERMINATED'
}

export enum PartnershipType {
  CoBranding = 'CO_BRANDING',
  Distributor = 'DISTRIBUTOR',
  Manufacturer = 'MANUFACTURER',
  StrategicPartner = 'STRATEGIC_PARTNER',
  Subcontractor = 'SUBCONTRACTOR',
  Supplier = 'SUPPLIER',
  WhiteLabel = 'WHITE_LABEL'
}

export type ProductionRevision = {
  __typename?: 'ProductionRevision';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  extraCost?: Maybe<Scalars['Float']['output']>;
  extraDays?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isApproved?: Maybe<Scalars['Boolean']['output']>;
  production?: Maybe<ProductionTracking>;
  productionId?: Maybe<Scalars['Int']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  requestedBy?: Maybe<User>;
  requestedById?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum ProductionStage {
  Cutting = 'CUTTING',
  Fabric = 'FABRIC',
  Packaging = 'PACKAGING',
  Planning = 'PLANNING',
  Quality = 'QUALITY',
  Sewing = 'SEWING',
  Shipping = 'SHIPPING'
}

export type ProductionStageEvent = {
  __typename?: 'ProductionStageEvent';
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  productionId?: Maybe<Scalars['Int']['output']>;
  stage?: Maybe<Scalars['String']['output']>;
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedBy?: Maybe<Scalars['Int']['output']>;
};

export type ProductionStageUpdate = {
  __typename?: 'ProductionStageUpdate';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  extraDays?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isRevision?: Maybe<Scalars['Boolean']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  stage?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum ProductionStatus {
  Blocked = 'BLOCKED',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  Waiting = 'WAITING'
}

export type ProductionStatusEvent = {
  __typename?: 'ProductionStatusEvent';
  actualCompletion?: Maybe<Scalars['DateTime']['output']>;
  currentStage?: Maybe<Scalars['String']['output']>;
  estimatedCompletion?: Maybe<Scalars['DateTime']['output']>;
  previousStatus?: Maybe<Scalars['String']['output']>;
  productionId?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ProductionTracking = {
  __typename?: 'ProductionTracking';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  currentStage?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  overallStatus?: Maybe<Scalars['String']['output']>;
  progress?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type QualityControl = {
  __typename?: 'QualityControl';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  fabricDefects?: Maybe<Scalars['Boolean']['output']>;
  finishingDefects?: Maybe<Scalars['Boolean']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  measureDefects?: Maybe<Scalars['Boolean']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  result?: Maybe<Scalars['String']['output']>;
  score?: Maybe<Scalars['Int']['output']>;
  sewingDefects?: Maybe<Scalars['Boolean']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type QualityControlEvent = {
  __typename?: 'QualityControlEvent';
  controlType?: Maybe<Scalars['String']['output']>;
  defects?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  inspectedAt?: Maybe<Scalars['DateTime']['output']>;
  inspectedBy?: Maybe<Scalars['Int']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  productionId?: Maybe<Scalars['Int']['output']>;
  result?: Maybe<Scalars['String']['output']>;
};

export enum QualityResult {
  ConditionalPass = 'CONDITIONAL_PASS',
  Failed = 'FAILED',
  Passed = 'PASSED',
  Pending = 'PENDING'
}

/** Root Query */
export type Query = {
  __typename?: 'Query';
  allCategories?: Maybe<Array<Category>>;
  allCompanies?: Maybe<Array<Company>>;
  allManufacturers?: Maybe<Array<User>>;
  allProductionTracking?: Maybe<Array<ProductionTracking>>;
  assignedOrders?: Maybe<QueryAssignedOrdersConnection>;
  assignedSamples?: Maybe<QueryAssignedSamplesConnection>;
  canAccessRoute?: Maybe<Scalars['Boolean']['output']>;
  categories?: Maybe<Array<Category>>;
  categoriesByCompany?: Maybe<QueryCategoriesByCompanyConnection>;
  category?: Maybe<Category>;
  categoryTree?: Maybe<Scalars['JSON']['output']>;
  collection?: Maybe<Collection>;
  collectionQuestions?: Maybe<QueryCollectionQuestionsConnection>;
  collectionTasks?: Maybe<QueryCollectionTasksConnection>;
  collections?: Maybe<Array<Collection>>;
  companies?: Maybe<Array<Company>>;
  company?: Maybe<Company>;
  companyDashboardStats?: Maybe<Scalars['JSON']['output']>;
  dashboardStats?: Maybe<Scalars['JSON']['output']>;
  departmentInfo?: Maybe<Scalars['JSON']['output']>;
  featuredCollections?: Maybe<Array<Collection>>;
  hasPermission?: Maybe<Scalars['Boolean']['output']>;
  libraryItem?: Maybe<LibraryItem>;
  libraryItemByCode?: Maybe<LibraryItem>;
  libraryItems?: Maybe<Array<LibraryItem>>;
  manufacturerOrders?: Maybe<QueryManufacturerOrdersConnection>;
  me?: Maybe<User>;
  message?: Maybe<Message>;
  messages?: Maybe<Array<Message>>;
  myCategories?: Maybe<QueryMyCategoriesConnection>;
  myCompany?: Maybe<Company>;
  myCompanyCategories?: Maybe<Array<CompanyCategory>>;
  myCompanyLibrary?: Maybe<Array<LibraryItem>>;
  myPermissions?: Maybe<Scalars['JSON']['output']>;
  myReviews?: Maybe<QueryMyReviewsConnection>;
  myTasks?: Maybe<Array<Task>>;
  myWorkshops?: Maybe<Array<Workshop>>;
  node?: Maybe<Node>;
  nodes: Array<Maybe<Node>>;
  notifications?: Maybe<Array<Notification>>;
  order?: Maybe<Order>;
  orderTasks?: Maybe<QueryOrderTasksConnection>;
  orders?: Maybe<Array<Order>>;
  pendingReviews?: Maybe<QueryPendingReviewsConnection>;
  pendingTasks?: Maybe<Array<Task>>;
  platformStandards?: Maybe<Array<LibraryItem>>;
  productMessages?: Maybe<QueryProductMessagesConnection>;
  productionAnalytics?: Maybe<Scalars['JSON']['output']>;
  productionTracking?: Maybe<ProductionTracking>;
  publicPlatformStats?: Maybe<Scalars['JSON']['output']>;
  question?: Maybe<Question>;
  questions?: Maybe<Array<Question>>;
  review?: Maybe<Review>;
  reviews?: Maybe<Array<Review>>;
  rootCategories?: Maybe<Array<Category>>;
  sample?: Maybe<Sample>;
  sampleTasks?: Maybe<QuerySampleTasksConnection>;
  samples?: Maybe<Array<Sample>>;
  standardCategories?: Maybe<Array<StandardCategory>>;
  task?: Maybe<Task>;
  taskAnalytics?: Maybe<Scalars['JSON']['output']>;
  unreadNotificationCount?: Maybe<Scalars['Int']['output']>;
  user?: Maybe<User>;
  userActivity?: Maybe<Scalars['JSON']['output']>;
  userStats?: Maybe<Scalars['JSON']['output']>;
  users?: Maybe<Array<User>>;
  usersCountByRole?: Maybe<Scalars['JSON']['output']>;
  workshop?: Maybe<Workshop>;
  workshopAnalytics?: Maybe<Scalars['JSON']['output']>;
  workshops?: Maybe<Array<Workshop>>;
};


/** Root Query */
export type QueryAllCategoriesArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryAllCompaniesArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


/** Root Query */
export type QueryAllManufacturersArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryAssignedOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


/** Root Query */
export type QueryAssignedSamplesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


/** Root Query */
export type QueryCanAccessRouteArgs = {
  route: Scalars['String']['input'];
};


/** Root Query */
export type QueryCategoriesArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryCategoriesByCompanyArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  companyId: Scalars['Int']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryCategoryArgs = {
  id: Scalars['Int']['input'];
};


/** Root Query */
export type QueryCollectionArgs = {
  id: Scalars['Int']['input'];
};


/** Root Query */
export type QueryCollectionQuestionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  answered?: InputMaybe<Scalars['Boolean']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  collectionId: Scalars['Int']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryCollectionTasksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  collectionId: Scalars['Int']['input'];
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryCollectionsArgs = {
  featured?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryCompaniesArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


/** Root Query */
export type QueryCompanyArgs = {
  id: Scalars['Int']['input'];
};


/** Root Query */
export type QueryCompanyDashboardStatsArgs = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


/** Root Query */
export type QueryFeaturedCollectionsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryHasPermissionArgs = {
  permission: Scalars['String']['input'];
};


/** Root Query */
export type QueryLibraryItemArgs = {
  id: Scalars['Int']['input'];
};


/** Root Query */
export type QueryLibraryItemByCodeArgs = {
  code: Scalars['String']['input'];
};


/** Root Query */
export type QueryLibraryItemsArgs = {
  filter?: InputMaybe<LibraryFilterInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryManufacturerOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


/** Root Query */
export type QueryMessageArgs = {
  id: Scalars['Int']['input'];
};


/** Root Query */
export type QueryMessagesArgs = {
  orderId?: InputMaybe<Scalars['Int']['input']>;
  sampleId?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryMyCategoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryMyCompanyLibraryArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
};


/** Root Query */
export type QueryMyReviewsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  approved?: InputMaybe<Scalars['Boolean']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryMyTasksArgs = {
  priority?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


/** Root Query */
export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


/** Root Query */
export type QueryNodesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


/** Root Query */
export type QueryNotificationsArgs = {
  isRead?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryOrderArgs = {
  id: Scalars['Int']['input'];
};


/** Root Query */
export type QueryOrderTasksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderId: Scalars['Int']['input'];
};


/** Root Query */
export type QueryOrdersArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryPendingReviewsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryPlatformStandardsArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
};


/** Root Query */
export type QueryProductMessagesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sampleId: Scalars['Int']['input'];
};


/** Root Query */
export type QueryProductionAnalyticsArgs = {
  orderId?: InputMaybe<Scalars['Int']['input']>;
  sampleId?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryProductionTrackingArgs = {
  id: Scalars['Int']['input'];
};


/** Root Query */
export type QueryQuestionArgs = {
  id: Scalars['Int']['input'];
};


/** Root Query */
export type QueryQuestionsArgs = {
  collectionId: Scalars['Int']['input'];
  isAnswered?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryReviewArgs = {
  id: Scalars['Int']['input'];
};


/** Root Query */
export type QueryReviewsArgs = {
  collectionId: Scalars['Int']['input'];
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QuerySampleArgs = {
  id: Scalars['Int']['input'];
};


/** Root Query */
export type QuerySampleTasksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sampleId: Scalars['Int']['input'];
};


/** Root Query */
export type QuerySamplesArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryStandardCategoriesArgs = {
  level?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryTaskArgs = {
  id: Scalars['Int']['input'];
};


/** Root Query */
export type QueryUserArgs = {
  id: Scalars['Int']['input'];
};


/** Root Query */
export type QueryUserActivityArgs = {
  userId: Scalars['Int']['input'];
};


/** Root Query */
export type QueryUsersArgs = {
  role?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Query */
export type QueryWorkshopArgs = {
  id: Scalars['Int']['input'];
};


/** Root Query */
export type QueryWorkshopsArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryAssignedOrdersConnection = {
  __typename?: 'QueryAssignedOrdersConnection';
  edges?: Maybe<Array<Maybe<QueryAssignedOrdersConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QueryAssignedOrdersConnectionEdge = {
  __typename?: 'QueryAssignedOrdersConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Order>;
};

export type QueryAssignedSamplesConnection = {
  __typename?: 'QueryAssignedSamplesConnection';
  edges?: Maybe<Array<Maybe<QueryAssignedSamplesConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QueryAssignedSamplesConnectionEdge = {
  __typename?: 'QueryAssignedSamplesConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Sample>;
};

export type QueryCategoriesByCompanyConnection = {
  __typename?: 'QueryCategoriesByCompanyConnection';
  edges?: Maybe<Array<Maybe<QueryCategoriesByCompanyConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QueryCategoriesByCompanyConnectionEdge = {
  __typename?: 'QueryCategoriesByCompanyConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Category>;
};

export type QueryCollectionQuestionsConnection = {
  __typename?: 'QueryCollectionQuestionsConnection';
  edges?: Maybe<Array<Maybe<QueryCollectionQuestionsConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QueryCollectionQuestionsConnectionEdge = {
  __typename?: 'QueryCollectionQuestionsConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Question>;
};

export type QueryCollectionTasksConnection = {
  __typename?: 'QueryCollectionTasksConnection';
  edges?: Maybe<Array<Maybe<QueryCollectionTasksConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QueryCollectionTasksConnectionEdge = {
  __typename?: 'QueryCollectionTasksConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Task>;
};

export type QueryManufacturerOrdersConnection = {
  __typename?: 'QueryManufacturerOrdersConnection';
  edges?: Maybe<Array<Maybe<QueryManufacturerOrdersConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QueryManufacturerOrdersConnectionEdge = {
  __typename?: 'QueryManufacturerOrdersConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Order>;
};

export type QueryMyCategoriesConnection = {
  __typename?: 'QueryMyCategoriesConnection';
  edges?: Maybe<Array<Maybe<QueryMyCategoriesConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QueryMyCategoriesConnectionEdge = {
  __typename?: 'QueryMyCategoriesConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Category>;
};

export type QueryMyReviewsConnection = {
  __typename?: 'QueryMyReviewsConnection';
  edges?: Maybe<Array<Maybe<QueryMyReviewsConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QueryMyReviewsConnectionEdge = {
  __typename?: 'QueryMyReviewsConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Review>;
};

export type QueryOrderTasksConnection = {
  __typename?: 'QueryOrderTasksConnection';
  edges?: Maybe<Array<Maybe<QueryOrderTasksConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QueryOrderTasksConnectionEdge = {
  __typename?: 'QueryOrderTasksConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Task>;
};

export type QueryPendingReviewsConnection = {
  __typename?: 'QueryPendingReviewsConnection';
  edges?: Maybe<Array<Maybe<QueryPendingReviewsConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QueryPendingReviewsConnectionEdge = {
  __typename?: 'QueryPendingReviewsConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Review>;
};

export type QueryProductMessagesConnection = {
  __typename?: 'QueryProductMessagesConnection';
  edges?: Maybe<Array<Maybe<QueryProductMessagesConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QueryProductMessagesConnectionEdge = {
  __typename?: 'QueryProductMessagesConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Message>;
};

export type QuerySampleTasksConnection = {
  __typename?: 'QuerySampleTasksConnection';
  edges?: Maybe<Array<Maybe<QuerySampleTasksConnectionEdge>>>;
  pageInfo: PageInfo;
};

export type QuerySampleTasksConnectionEdge = {
  __typename?: 'QuerySampleTasksConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Task>;
};

export type Question = {
  __typename?: 'Question';
  answer?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isAnswered?: Maybe<Scalars['Boolean']['output']>;
  isPublic?: Maybe<Scalars['Boolean']['output']>;
  question?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum ReportPeriod {
  Custom = 'CUSTOM',
  Daily = 'DAILY',
  Monthly = 'MONTHLY',
  Quarterly = 'QUARTERLY',
  Weekly = 'WEEKLY',
  Yearly = 'YEARLY'
}

export enum ReportType {
  CompanyComparison = 'COMPANY_COMPARISON',
  Custom = 'CUSTOM',
  Financial = 'FINANCIAL',
  MarketAnalysis = 'MARKET_ANALYSIS',
  Performance = 'PERFORMANCE',
  Quality = 'QUALITY',
  TrendAnalysis = 'TREND_ANALYSIS'
}

export type Review = {
  __typename?: 'Review';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isApproved?: Maybe<Scalars['Boolean']['output']>;
  rating?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Revision = {
  __typename?: 'Revision';
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  order?: Maybe<Order>;
  orderId?: Maybe<Scalars['Int']['output']>;
  productionTracking?: Maybe<ProductionTracking>;
  productionTrackingId?: Maybe<Scalars['Int']['output']>;
  requestMessage?: Maybe<Scalars['String']['output']>;
  requestedAt?: Maybe<Scalars['DateTime']['output']>;
  responseMessage?: Maybe<Scalars['String']['output']>;
  revisionNumber?: Maybe<Scalars['Int']['output']>;
  sample?: Maybe<Sample>;
  sampleId?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum Role {
  Admin = 'ADMIN',
  CompanyEmployee = 'COMPANY_EMPLOYEE',
  CompanyOwner = 'COMPANY_OWNER',
  Customer = 'CUSTOMER',
  IndividualCustomer = 'INDIVIDUAL_CUSTOMER',
  Manufacture = 'MANUFACTURE'
}

export type Sample = Node & {
  __typename?: 'Sample';
  actualProductionDate?: Maybe<Scalars['DateTime']['output']>;
  aiGenerated?: Maybe<Scalars['Boolean']['output']>;
  aiPrompt?: Maybe<Scalars['String']['output']>;
  aiSketchUrl?: Maybe<Scalars['String']['output']>;
  collection?: Maybe<Collection>;
  collectionId?: Maybe<Scalars['Int']['output']>;
  company?: Maybe<Company>;
  companyId?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  customDesignImages?: Maybe<Scalars['String']['output']>;
  customer?: Maybe<User>;
  customerId?: Maybe<Scalars['Int']['output']>;
  customerNote?: Maybe<Scalars['String']['output']>;
  customerQuoteDays?: Maybe<Scalars['Int']['output']>;
  customerQuoteNote?: Maybe<Scalars['String']['output']>;
  customerQuotedPrice?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  estimatedProductionDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  images?: Maybe<Scalars['String']['output']>;
  lastViewedAt?: Maybe<Scalars['DateTime']['output']>;
  manufacture?: Maybe<User>;
  manufactureId?: Maybe<Scalars['Int']['output']>;
  manufacturerResponse?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  productionDays?: Maybe<Scalars['Int']['output']>;
  sampleNumber?: Maybe<Scalars['String']['output']>;
  sampleType?: Maybe<Scalars['String']['output']>;
  shareCount?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  unitPrice?: Maybe<Scalars['Float']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  viewCount?: Maybe<Scalars['Int']['output']>;
};

export type SampleProduction = {
  __typename?: 'SampleProduction';
  actualDate?: Maybe<Scalars['DateTime']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  estimatedDays?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  sample?: Maybe<Sample>;
  sampleId?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<User>;
  updatedById?: Maybe<Scalars['Int']['output']>;
};

export enum SampleStatus {
  AiDesign = 'AI_DESIGN',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Confirmed = 'CONFIRMED',
  CustomerQuoteSent = 'CUSTOMER_QUOTE_SENT',
  Delivered = 'DELIVERED',
  InDesign = 'IN_DESIGN',
  InProduction = 'IN_PRODUCTION',
  ManufacturerReviewingQuote = 'MANUFACTURER_REVIEWING_QUOTE',
  OnHold = 'ON_HOLD',
  PatternReady = 'PATTERN_READY',
  Pending = 'PENDING',
  PendingApproval = 'PENDING_APPROVAL',
  ProductionComplete = 'PRODUCTION_COMPLETE',
  QualityCheck = 'QUALITY_CHECK',
  QuoteSent = 'QUOTE_SENT',
  Received = 'RECEIVED',
  Rejected = 'REJECTED',
  RejectedByCustomer = 'REJECTED_BY_CUSTOMER',
  RejectedByManufacturer = 'REJECTED_BY_MANUFACTURER',
  Requested = 'REQUESTED',
  Reviewed = 'REVIEWED',
  Shipped = 'SHIPPED'
}

export enum SampleType {
  Custom = 'CUSTOM',
  Development = 'DEVELOPMENT',
  Revision = 'REVISION',
  Standard = 'STANDARD'
}

export enum Season {
  Fw25 = 'FW25',
  Fw26 = 'FW26',
  Fw27 = 'FW27',
  Ss25 = 'SS25',
  Ss26 = 'SS26',
  Ss27 = 'SS27'
}

export type SignupInput = {
  accountType: Scalars['String']['input'];
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export enum StageStatus {
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  NotStarted = 'NOT_STARTED',
  OnHold = 'ON_HOLD',
  RequiresRevision = 'REQUIRES_REVISION'
}

export type StandardCategory = {
  __typename?: 'StandardCategory';
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdBy?: Maybe<User>;
  createdById?: Maybe<Scalars['Int']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isPublic?: Maybe<Scalars['Boolean']['output']>;
  keywords?: Maybe<Scalars['String']['output']>;
  level?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Scalars['Int']['output']>;
  parentCategory?: Maybe<StandardCategory>;
  parentId?: Maybe<Scalars['Int']['output']>;
  subCategories?: Maybe<Array<StandardCategory>>;
  tags?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** Root Subscription for Real-Time Updates */
export type Subscription = {
  __typename?: 'Subscription';
  /** Subscribe to new notifications for the authenticated user */
  newNotification?: Maybe<NotificationEvent>;
  /** Subscribe to notification read status changes */
  notificationRead?: Maybe<NotificationReadEvent>;
  /** Subscribe to quality control updates for production */
  productionQualityControl?: Maybe<QualityControlEvent>;
  /** Subscribe to production stage updates */
  productionStageUpdated?: Maybe<ProductionStageEvent>;
  /** Subscribe to production status changes */
  productionStatusChanged?: Maybe<ProductionStatusEvent>;
  /** Subscribe to tasks assigned to the authenticated user */
  taskAssigned?: Maybe<TaskEvent>;
  /** Subscribe to new tasks created for the authenticated user */
  taskCreated?: Maybe<TaskEvent>;
  /** Subscribe to status changes for a specific task */
  taskStatusChanged?: Maybe<TaskStatusEvent>;
};


/** Root Subscription for Real-Time Updates */
export type SubscriptionProductionQualityControlArgs = {
  productionId: Scalars['Int']['input'];
};


/** Root Subscription for Real-Time Updates */
export type SubscriptionProductionStageUpdatedArgs = {
  productionId: Scalars['Int']['input'];
};


/** Root Subscription for Real-Time Updates */
export type SubscriptionProductionStatusChangedArgs = {
  productionId: Scalars['Int']['input'];
};


/** Root Subscription for Real-Time Updates */
export type SubscriptionTaskStatusChangedArgs = {
  taskId: Scalars['Int']['input'];
};

export enum SubscriptionPlan {
  Custom = 'CUSTOM',
  Enterprise = 'ENTERPRISE',
  Free = 'FREE',
  Professional = 'PROFESSIONAL',
  Starter = 'STARTER'
}

export enum SubscriptionStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
  PastDue = 'PAST_DUE',
  Trial = 'TRIAL'
}

export type Task = {
  __typename?: 'Task';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  priority?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type TaskEvent = {
  __typename?: 'TaskEvent';
  assignedUserId?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdById?: Maybe<Scalars['Int']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  orderId?: Maybe<Scalars['Int']['output']>;
  priority?: Maybe<Scalars['String']['output']>;
  productionTrackingId?: Maybe<Scalars['Int']['output']>;
  sampleId?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum TaskPriority {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

export enum TaskStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  Todo = 'TODO'
}

export type TaskStatusEvent = {
  __typename?: 'TaskStatusEvent';
  previousStatus?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  taskId?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedBy?: Maybe<Scalars['Int']['output']>;
};

export enum TaskType {
  ApproveReject = 'APPROVE_REJECT',
  DeadlineWarning = 'DEADLINE_WARNING',
  Document = 'DOCUMENT',
  Material = 'MATERIAL',
  Meeting = 'MEETING',
  Notification = 'NOTIFICATION',
  Other = 'OTHER',
  Payment = 'PAYMENT',
  ProductionStage = 'PRODUCTION_STAGE',
  QualityCheck = 'QUALITY_CHECK',
  Quotation = 'QUOTATION',
  ReviewQuote = 'REVIEW_QUOTE',
  Revision = 'REVISION',
  Shipment = 'SHIPMENT',
  StatusChange = 'STATUS_CHANGE'
}

export type UpdateLibraryItemInput = {
  data?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  internalCode?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isPopular?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Scalars['String']['input']>;
};

export type User = Node & {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  company?: Maybe<Company>;
  companyId?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  customAvatar?: Maybe<Scalars['String']['output']>;
  department?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailNotifications?: Maybe<Scalars['Boolean']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isCompanyOwner?: Maybe<Scalars['Boolean']['output']>;
  isPendingApproval?: Maybe<Scalars['Boolean']['output']>;
  jobTitle?: Maybe<Scalars['String']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  pushNotifications?: Maybe<Scalars['Boolean']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  socialLinks?: Maybe<Scalars['String']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

export type UserFavoriteCollection = {
  __typename?: 'UserFavoriteCollection';
  collection?: Maybe<Collection>;
  collectionId?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  user?: Maybe<User>;
  userId?: Maybe<Scalars['Int']['output']>;
};

export type Workshop = {
  __typename?: 'Workshop';
  capacity?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum WorkshopType {
  General = 'GENERAL',
  Packaging = 'PACKAGING',
  QualityControl = 'QUALITY_CONTROL',
  Sewing = 'SEWING'
}

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser?: { __typename?: 'User', id: string, name?: string | null } | null };

export type GetUserQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, name?: string | null, email?: string | null } | null };

export type AdminUsersQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type AdminUsersQuery = { __typename?: 'Query', users?: Array<{ __typename?: 'User', id: string, email?: string | null, name?: string | null, firstName?: string | null, lastName?: string | null, phone?: string | null, role?: string | null, department?: string | null, jobTitle?: string | null, isActive?: boolean | null, isPendingApproval?: boolean | null, createdAt?: any | null, updatedAt?: any | null, company?: { __typename?: 'Company', id: string, name?: string | null, type?: string | null } | null }> | null };

export type AdminUsersCountByRoleQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminUsersCountByRoleQuery = { __typename?: 'Query', usersCountByRole?: any | null };

export type AdminUserQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type AdminUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, email?: string | null, name?: string | null, firstName?: string | null, lastName?: string | null, phone?: string | null, role?: string | null, department?: string | null, jobTitle?: string | null, isActive?: boolean | null, isPendingApproval?: boolean | null, avatar?: string | null, customAvatar?: string | null, bio?: string | null, socialLinks?: string | null, emailNotifications?: boolean | null, pushNotifications?: boolean | null, language?: string | null, timezone?: string | null, createdAt?: any | null, updatedAt?: any | null, company?: { __typename?: 'Company', id: string, name?: string | null, type?: string | null, email?: string | null } | null } | null };

export type AdminUserActivityQueryVariables = Exact<{
  userId: Scalars['Int']['input'];
}>;


export type AdminUserActivityQuery = { __typename?: 'Query', userActivity?: any | null };

export type AdminCompaniesQueryVariables = Exact<{
  take?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type AdminCompaniesQuery = { __typename?: 'Query', companies?: Array<{ __typename?: 'Company', id: string, name?: string | null, type?: string | null, email?: string | null }> | null };

export type AdminCreateUserMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  name: Scalars['String']['input'];
  role: Scalars['String']['input'];
  companyId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AdminCreateUserMutation = { __typename?: 'Mutation', createUserByAdmin?: { __typename?: 'User', id: string, email?: string | null, name?: string | null, role?: string | null, createdAt?: any | null, company?: { __typename?: 'Company', id: string, name?: string | null } | null } | null };

export type AdminUpdateUserMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
  department?: InputMaybe<Scalars['String']['input']>;
  jobTitle?: InputMaybe<Scalars['String']['input']>;
}>;


export type AdminUpdateUserMutation = { __typename?: 'Mutation', updateUser?: { __typename?: 'User', id: string, name?: string | null, email?: string | null, phone?: string | null, role?: string | null, companyId?: number | null, department?: string | null, jobTitle?: string | null, updatedAt?: any | null } | null };

export type AdminDeleteUserMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type AdminDeleteUserMutation = { __typename?: 'Mutation', deleteUserByAdmin?: boolean | null };

export type AdminResetUserPasswordMutationVariables = Exact<{
  userId: Scalars['Int']['input'];
  newPassword: Scalars['String']['input'];
}>;


export type AdminResetUserPasswordMutation = { __typename?: 'Mutation', resetUserPassword?: { __typename?: 'User', id: string, email?: string | null, name?: string | null } | null };

export type AdminUpdateUserRoleMutationVariables = Exact<{
  userId: Scalars['Int']['input'];
  role: Scalars['String']['input'];
}>;


export type AdminUpdateUserRoleMutation = { __typename?: 'Mutation', updateUserRole?: { __typename?: 'User', id: string, email?: string | null, name?: string | null, role?: string | null } | null };

export type AdminToggleUserStatusMutationVariables = Exact<{
  userId: Scalars['Int']['input'];
  isActive: Scalars['Boolean']['input'];
}>;


export type AdminToggleUserStatusMutation = { __typename?: 'Mutation', toggleUserStatusByAdmin?: { __typename?: 'User', id: string, email?: string | null, name?: string | null, isActive?: boolean | null } | null };

export type AdminUpdateUserCompanyMutationVariables = Exact<{
  userId: Scalars['Int']['input'];
  companyId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AdminUpdateUserCompanyMutation = { __typename?: 'Mutation', updateUserCompanyByAdmin?: { __typename?: 'User', id: string, email?: string | null, name?: string | null, company?: { __typename?: 'Company', id: string, name?: string | null } | null } | null };

export type AdminBulkToggleUserStatusMutationVariables = Exact<{
  userIds: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
  isActive: Scalars['Boolean']['input'];
}>;


export type AdminBulkToggleUserStatusMutation = { __typename?: 'Mutation', bulkToggleUserStatus?: any | null };

export type AdminBulkDeleteUsersMutationVariables = Exact<{
  userIds: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
}>;


export type AdminBulkDeleteUsersMutation = { __typename?: 'Mutation', bulkDeleteUsersByAdmin?: any | null };

export type AuthRequestPasswordResetMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type AuthRequestPasswordResetMutation = { __typename?: 'Mutation', requestPasswordReset?: any | null };

export type AuthResetPasswordMutationVariables = Exact<{
  token: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;


export type AuthResetPasswordMutation = { __typename?: 'Mutation', resetPassword?: any | null };

export type AuthVerifyEmailMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type AuthVerifyEmailMutation = { __typename?: 'Mutation', verifyEmail?: any | null };

export type AuthResendVerificationEmailMutationVariables = Exact<{ [key: string]: never; }>;


export type AuthResendVerificationEmailMutation = { __typename?: 'Mutation', resendVerificationEmail?: any | null };

export type AuthRefreshTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type AuthRefreshTokenMutation = { __typename?: 'Mutation', refreshToken?: string | null };

export type DashboardGetMyCompanyQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardGetMyCompanyQuery = { __typename?: 'Query', myCompany?: { __typename?: 'Company', id: string, name?: string | null, email?: string | null, phone?: string | null, website?: string | null, address?: string | null } | null };

export type DashboardResendVerificationEmailMutationVariables = Exact<{ [key: string]: never; }>;


export type DashboardResendVerificationEmailMutation = { __typename?: 'Mutation', resendVerificationEmail?: any | null };

export type AuthOperationSignupMutationVariables = Exact<{
  input: SignupInput;
}>;


export type AuthOperationSignupMutation = { __typename?: 'Mutation', signup?: any | null };

export type AuthOperationLoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type AuthOperationLoginMutation = { __typename?: 'Mutation', login?: any | null };

export type AuthOperationSignupOAuthMutationVariables = Exact<{
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;


export type AuthOperationSignupOAuthMutation = { __typename?: 'Mutation', signupOAuth?: any | null };

export type AuthOperationRefreshTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type AuthOperationRefreshTokenMutation = { __typename?: 'Mutation', refreshToken?: string | null };

export type FileUploadSingleMutationVariables = Exact<{
  file: Scalars['File']['input'];
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type FileUploadSingleMutation = { __typename?: 'Mutation', singleUpload?: any | null };

export type FileUploadMultipleMutationVariables = Exact<{
  files: Array<Scalars['File']['input']> | Scalars['File']['input'];
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type FileUploadMultipleMutation = { __typename?: 'Mutation', multipleUpload?: any | null };

export type NotificationOnNewNotificationSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NotificationOnNewNotificationSubscription = { __typename?: 'Subscription', newNotification?: { __typename?: 'NotificationEvent', id?: number | null, title?: string | null, message?: string | null, type?: string | null, isRead?: boolean | null, relatedEntityType?: string | null, relatedEntityId?: number | null, actionUrl?: string | null, createdAt?: any | null } | null };

export type NotificationOnTaskAssignedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NotificationOnTaskAssignedSubscription = { __typename?: 'Subscription', taskAssigned?: { __typename?: 'TaskEvent', id?: number | null, title?: string | null, description?: string | null, priority?: string | null, dueDate?: any | null, createdAt?: any | null } | null };

export type SettingsGetCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type SettingsGetCurrentUserQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, name?: string | null, firstName?: string | null, lastName?: string | null, email?: string | null, phone?: string | null, jobTitle?: string | null, bio?: string | null, avatar?: string | null, customAvatar?: string | null, socialLinks?: string | null, emailNotifications?: boolean | null, pushNotifications?: boolean | null, language?: string | null, timezone?: string | null } | null };

export type SettingsGetMyCompanyQueryVariables = Exact<{ [key: string]: never; }>;


export type SettingsGetMyCompanyQuery = { __typename?: 'Query', myCompany?: { __typename?: 'Company', id: string, name?: string | null, email?: string | null, phone?: string | null, description?: string | null, website?: string | null, address?: string | null, city?: string | null, country?: string | null, logo?: string | null, coverImage?: string | null, type?: string | null, socialLinks?: string | null, brandColors?: string | null, profileSlug?: string | null, isPublicProfile?: boolean | null } | null };

export type SettingsUpdateUserProfileMutationVariables = Exact<{
  name?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  jobTitle?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  customAvatar?: InputMaybe<Scalars['String']['input']>;
  socialLinks?: InputMaybe<Scalars['String']['input']>;
}>;


export type SettingsUpdateUserProfileMutation = { __typename?: 'Mutation', updateProfile?: { __typename?: 'User', id: string, name?: string | null, firstName?: string | null, lastName?: string | null, phone?: string | null, jobTitle?: string | null, bio?: string | null, avatar?: string | null, customAvatar?: string | null, socialLinks?: string | null } | null };

export type SettingsUpdateUserNotificationsMutationVariables = Exact<{
  emailNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  pushNotifications?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type SettingsUpdateUserNotificationsMutation = { __typename?: 'Mutation', updateProfile?: { __typename?: 'User', id: string, emailNotifications?: boolean | null, pushNotifications?: boolean | null } | null };

export type SettingsUpdateUserPreferencesMutationVariables = Exact<{
  language?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
}>;


export type SettingsUpdateUserPreferencesMutation = { __typename?: 'Mutation', updateProfile?: { __typename?: 'User', id: string, language?: string | null, timezone?: string | null } | null };

export type SettingsUpdateCompanyInfoMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  coverImage?: InputMaybe<Scalars['String']['input']>;
  socialLinks?: InputMaybe<Scalars['String']['input']>;
  brandColors?: InputMaybe<Scalars['String']['input']>;
  profileSlug?: InputMaybe<Scalars['String']['input']>;
  isPublicProfile?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type SettingsUpdateCompanyInfoMutation = { __typename?: 'Mutation', updateCompany?: { __typename?: 'Company', id: string, name?: string | null, email?: string | null, phone?: string | null, description?: string | null, website?: string | null, address?: string | null, city?: string | null, country?: string | null, logo?: string | null, coverImage?: string | null, socialLinks?: string | null, brandColors?: string | null, profileSlug?: string | null, isPublicProfile?: boolean | null } | null };

export type SettingsResendVerificationEmailMutationVariables = Exact<{ [key: string]: never; }>;


export type SettingsResendVerificationEmailMutation = { __typename?: 'Mutation', resendVerificationEmail?: any | null };


export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const GetUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<GetUserQuery, GetUserQueryVariables>;
export const AdminUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"department"}},{"kind":"Field","name":{"kind":"Name","value":"jobTitle"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isPendingApproval"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"company"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]} as unknown as DocumentNode<AdminUsersQuery, AdminUsersQueryVariables>;
export const AdminUsersCountByRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminUsersCountByRole"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"usersCountByRole"}}]}}]} as unknown as DocumentNode<AdminUsersCountByRoleQuery, AdminUsersCountByRoleQueryVariables>;
export const AdminUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"department"}},{"kind":"Field","name":{"kind":"Name","value":"jobTitle"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isPendingApproval"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"customAvatar"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"socialLinks"}},{"kind":"Field","name":{"kind":"Name","value":"emailNotifications"}},{"kind":"Field","name":{"kind":"Name","value":"pushNotifications"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"company"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<AdminUserQuery, AdminUserQueryVariables>;
export const AdminUserActivityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminUserActivity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userActivity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<AdminUserActivityQuery, AdminUserActivityQueryVariables>;
export const AdminCompaniesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCompanies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"companies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<AdminCompaniesQuery, AdminCompaniesQueryVariables>;
export const AdminCreateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"companyId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createUserByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"companyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"companyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"company"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<AdminCreateUserMutation, AdminCreateUserMutationVariables>;
export const AdminUpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"phone"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"companyId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"department"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobTitle"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"phone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"phone"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"companyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"companyId"}}},{"kind":"Argument","name":{"kind":"Name","value":"department"},"value":{"kind":"Variable","name":{"kind":"Name","value":"department"}}},{"kind":"Argument","name":{"kind":"Name","value":"jobTitle"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobTitle"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"companyId"}},{"kind":"Field","name":{"kind":"Name","value":"department"}},{"kind":"Field","name":{"kind":"Name","value":"jobTitle"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateUserMutation, AdminUpdateUserMutationVariables>;
export const AdminDeleteUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteUserByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<AdminDeleteUserMutation, AdminDeleteUserMutationVariables>;
export const AdminResetUserPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminResetUserPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"newPassword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetUserPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"newPassword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"newPassword"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AdminResetUserPasswordMutation, AdminResetUserPasswordMutationVariables>;
export const AdminUpdateUserRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateUserRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateUserRoleMutation, AdminUpdateUserRoleMutationVariables>;
export const AdminToggleUserStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminToggleUserStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"toggleUserStatusByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"isActive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<AdminToggleUserStatusMutation, AdminToggleUserStatusMutationVariables>;
export const AdminUpdateUserCompanyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateUserCompany"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"companyId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserCompanyByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"companyId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"companyId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"company"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<AdminUpdateUserCompanyMutation, AdminUpdateUserCompanyMutationVariables>;
export const AdminBulkToggleUserStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminBulkToggleUserStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bulkToggleUserStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userIds"}}},{"kind":"Argument","name":{"kind":"Name","value":"isActive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isActive"}}}]}]}}]} as unknown as DocumentNode<AdminBulkToggleUserStatusMutation, AdminBulkToggleUserStatusMutationVariables>;
export const AdminBulkDeleteUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminBulkDeleteUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bulkDeleteUsersByAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userIds"}}}]}]}}]} as unknown as DocumentNode<AdminBulkDeleteUsersMutation, AdminBulkDeleteUsersMutationVariables>;
export const AuthRequestPasswordResetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AuthRequestPasswordReset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestPasswordReset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}]}]}}]} as unknown as DocumentNode<AuthRequestPasswordResetMutation, AuthRequestPasswordResetMutationVariables>;
export const AuthResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AuthResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"newPassword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}},{"kind":"Argument","name":{"kind":"Name","value":"newPassword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"newPassword"}}}]}]}}]} as unknown as DocumentNode<AuthResetPasswordMutation, AuthResetPasswordMutationVariables>;
export const AuthVerifyEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AuthVerifyEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}]}]}}]} as unknown as DocumentNode<AuthVerifyEmailMutation, AuthVerifyEmailMutationVariables>;
export const AuthResendVerificationEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AuthResendVerificationEmail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resendVerificationEmail"}}]}}]} as unknown as DocumentNode<AuthResendVerificationEmailMutation, AuthResendVerificationEmailMutationVariables>;
export const AuthRefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AuthRefreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]} as unknown as DocumentNode<AuthRefreshTokenMutation, AuthRefreshTokenMutationVariables>;
export const DashboardGetMyCompanyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashboardGetMyCompany"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myCompany"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"website"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<DashboardGetMyCompanyQuery, DashboardGetMyCompanyQueryVariables>;
export const DashboardResendVerificationEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DashboardResendVerificationEmail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resendVerificationEmail"}}]}}]} as unknown as DocumentNode<DashboardResendVerificationEmailMutation, DashboardResendVerificationEmailMutationVariables>;
export const AuthOperationSignupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AuthOperationSignup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SignupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<AuthOperationSignupMutation, AuthOperationSignupMutationVariables>;
export const AuthOperationLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AuthOperationLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}]}]}}]} as unknown as DocumentNode<AuthOperationLoginMutation, AuthOperationLoginMutationVariables>;
export const AuthOperationSignupOAuthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AuthOperationSignupOAuth"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signupOAuth"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}]}]}}]} as unknown as DocumentNode<AuthOperationSignupOAuthMutation, AuthOperationSignupOAuthMutationVariables>;
export const AuthOperationRefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AuthOperationRefreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]} as unknown as DocumentNode<AuthOperationRefreshTokenMutation, AuthOperationRefreshTokenMutationVariables>;
export const FileUploadSingleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FileUploadSingle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"file"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"File"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"description"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"singleUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"file"},"value":{"kind":"Variable","name":{"kind":"Name","value":"file"}}},{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}},{"kind":"Argument","name":{"kind":"Name","value":"description"},"value":{"kind":"Variable","name":{"kind":"Name","value":"description"}}}]}]}}]} as unknown as DocumentNode<FileUploadSingleMutation, FileUploadSingleMutationVariables>;
export const FileUploadMultipleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FileUploadMultiple"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"files"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"File"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"description"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"multipleUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"files"},"value":{"kind":"Variable","name":{"kind":"Name","value":"files"}}},{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}},{"kind":"Argument","name":{"kind":"Name","value":"description"},"value":{"kind":"Variable","name":{"kind":"Name","value":"description"}}}]}]}}]} as unknown as DocumentNode<FileUploadMultipleMutation, FileUploadMultipleMutationVariables>;
export const NotificationOnNewNotificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"NotificationOnNewNotification"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"newNotification"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"relatedEntityType"}},{"kind":"Field","name":{"kind":"Name","value":"relatedEntityId"}},{"kind":"Field","name":{"kind":"Name","value":"actionUrl"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<NotificationOnNewNotificationSubscription, NotificationOnNewNotificationSubscriptionVariables>;
export const NotificationOnTaskAssignedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"NotificationOnTaskAssigned"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"taskAssigned"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"priority"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<NotificationOnTaskAssignedSubscription, NotificationOnTaskAssignedSubscriptionVariables>;
export const SettingsGetCurrentUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SettingsGetCurrentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"jobTitle"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"customAvatar"}},{"kind":"Field","name":{"kind":"Name","value":"socialLinks"}},{"kind":"Field","name":{"kind":"Name","value":"emailNotifications"}},{"kind":"Field","name":{"kind":"Name","value":"pushNotifications"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}}]}}]}}]} as unknown as DocumentNode<SettingsGetCurrentUserQuery, SettingsGetCurrentUserQueryVariables>;
export const SettingsGetMyCompanyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SettingsGetMyCompany"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myCompany"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"website"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}},{"kind":"Field","name":{"kind":"Name","value":"coverImage"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"socialLinks"}},{"kind":"Field","name":{"kind":"Name","value":"brandColors"}},{"kind":"Field","name":{"kind":"Name","value":"profileSlug"}},{"kind":"Field","name":{"kind":"Name","value":"isPublicProfile"}}]}}]}}]} as unknown as DocumentNode<SettingsGetMyCompanyQuery, SettingsGetMyCompanyQueryVariables>;
export const SettingsUpdateUserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SettingsUpdateUserProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"firstName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lastName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"phone"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"jobTitle"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bio"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"avatar"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customAvatar"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"socialLinks"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"firstName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"firstName"}}},{"kind":"Argument","name":{"kind":"Name","value":"lastName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lastName"}}},{"kind":"Argument","name":{"kind":"Name","value":"phone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"phone"}}},{"kind":"Argument","name":{"kind":"Name","value":"jobTitle"},"value":{"kind":"Variable","name":{"kind":"Name","value":"jobTitle"}}},{"kind":"Argument","name":{"kind":"Name","value":"bio"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bio"}}},{"kind":"Argument","name":{"kind":"Name","value":"avatar"},"value":{"kind":"Variable","name":{"kind":"Name","value":"avatar"}}},{"kind":"Argument","name":{"kind":"Name","value":"customAvatar"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customAvatar"}}},{"kind":"Argument","name":{"kind":"Name","value":"socialLinks"},"value":{"kind":"Variable","name":{"kind":"Name","value":"socialLinks"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"jobTitle"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"customAvatar"}},{"kind":"Field","name":{"kind":"Name","value":"socialLinks"}}]}}]}}]} as unknown as DocumentNode<SettingsUpdateUserProfileMutation, SettingsUpdateUserProfileMutationVariables>;
export const SettingsUpdateUserNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SettingsUpdateUserNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"emailNotifications"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pushNotifications"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"emailNotifications"},"value":{"kind":"Variable","name":{"kind":"Name","value":"emailNotifications"}}},{"kind":"Argument","name":{"kind":"Name","value":"pushNotifications"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pushNotifications"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"emailNotifications"}},{"kind":"Field","name":{"kind":"Name","value":"pushNotifications"}}]}}]}}]} as unknown as DocumentNode<SettingsUpdateUserNotificationsMutation, SettingsUpdateUserNotificationsMutationVariables>;
export const SettingsUpdateUserPreferencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SettingsUpdateUserPreferences"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"language"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"timezone"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"language"},"value":{"kind":"Variable","name":{"kind":"Name","value":"language"}}},{"kind":"Argument","name":{"kind":"Name","value":"timezone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"timezone"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}}]}}]}}]} as unknown as DocumentNode<SettingsUpdateUserPreferencesMutation, SettingsUpdateUserPreferencesMutationVariables>;
export const SettingsUpdateCompanyInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SettingsUpdateCompanyInfo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"phone"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"description"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"website"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"address"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"city"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"country"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"logo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"coverImage"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"socialLinks"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"brandColors"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"profileSlug"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"isPublicProfile"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCompany"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"phone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"phone"}}},{"kind":"Argument","name":{"kind":"Name","value":"description"},"value":{"kind":"Variable","name":{"kind":"Name","value":"description"}}},{"kind":"Argument","name":{"kind":"Name","value":"website"},"value":{"kind":"Variable","name":{"kind":"Name","value":"website"}}},{"kind":"Argument","name":{"kind":"Name","value":"address"},"value":{"kind":"Variable","name":{"kind":"Name","value":"address"}}},{"kind":"Argument","name":{"kind":"Name","value":"city"},"value":{"kind":"Variable","name":{"kind":"Name","value":"city"}}},{"kind":"Argument","name":{"kind":"Name","value":"country"},"value":{"kind":"Variable","name":{"kind":"Name","value":"country"}}},{"kind":"Argument","name":{"kind":"Name","value":"logo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"logo"}}},{"kind":"Argument","name":{"kind":"Name","value":"coverImage"},"value":{"kind":"Variable","name":{"kind":"Name","value":"coverImage"}}},{"kind":"Argument","name":{"kind":"Name","value":"socialLinks"},"value":{"kind":"Variable","name":{"kind":"Name","value":"socialLinks"}}},{"kind":"Argument","name":{"kind":"Name","value":"brandColors"},"value":{"kind":"Variable","name":{"kind":"Name","value":"brandColors"}}},{"kind":"Argument","name":{"kind":"Name","value":"profileSlug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"profileSlug"}}},{"kind":"Argument","name":{"kind":"Name","value":"isPublicProfile"},"value":{"kind":"Variable","name":{"kind":"Name","value":"isPublicProfile"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"website"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"logo"}},{"kind":"Field","name":{"kind":"Name","value":"coverImage"}},{"kind":"Field","name":{"kind":"Name","value":"socialLinks"}},{"kind":"Field","name":{"kind":"Name","value":"brandColors"}},{"kind":"Field","name":{"kind":"Name","value":"profileSlug"}},{"kind":"Field","name":{"kind":"Name","value":"isPublicProfile"}}]}}]}}]} as unknown as DocumentNode<SettingsUpdateCompanyInfoMutation, SettingsUpdateCompanyInfoMutationVariables>;
export const SettingsResendVerificationEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SettingsResendVerificationEmail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resendVerificationEmail"}}]}}]} as unknown as DocumentNode<SettingsResendVerificationEmailMutation, SettingsResendVerificationEmailMutationVariables>;