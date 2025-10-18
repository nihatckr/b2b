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
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type Category = {
  __typename?: 'Category';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Certification = {
  __typename?: 'Certification';
  category?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Collection = {
  __typename?: 'Collection';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isFeatured?: Maybe<Scalars['Boolean']['output']>;
  modelCode?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  season?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Color = {
  __typename?: 'Color';
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  hexCode?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Company = {
  __typename?: 'Company';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Fabric = {
  __typename?: 'Fabric';
  code?: Maybe<Scalars['String']['output']>;
  composition?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  weight?: Maybe<Scalars['Int']['output']>;
};

export type FitItem = {
  __typename?: 'FitItem';
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

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
  cancelOrder?: Maybe<Order>;
  cancelSample?: Maybe<Sample>;
  changePassword?: Maybe<Scalars['Boolean']['output']>;
  checkOllamaStatus?: Maybe<Scalars['JSON']['output']>;
  completeProductionStage?: Maybe<ProductionTracking>;
  completeTask?: Maybe<Task>;
  createCategory?: Maybe<Category>;
  createCertification?: Maybe<Certification>;
  createCollection?: Maybe<Collection>;
  createColor?: Maybe<Color>;
  createCompany?: Maybe<Company>;
  createFabric?: Maybe<Fabric>;
  createFit?: Maybe<FitItem>;
  createOrder?: Maybe<Order>;
  createReview?: Maybe<Review>;
  createSample?: Maybe<Sample>;
  createSeason?: Maybe<SeasonItem>;
  createSizeGroup?: Maybe<SizeGroup>;
  createTask?: Maybe<Task>;
  createUser?: Maybe<User>;
  createWorkshop?: Maybe<Workshop>;
  deleteCategory?: Maybe<Scalars['Boolean']['output']>;
  deleteCertification?: Maybe<Scalars['Boolean']['output']>;
  deleteCollection?: Maybe<Scalars['Boolean']['output']>;
  deleteColor?: Maybe<Scalars['Boolean']['output']>;
  deleteFabric?: Maybe<Scalars['Boolean']['output']>;
  deleteFit?: Maybe<Scalars['Boolean']['output']>;
  deleteMessage?: Maybe<Scalars['Boolean']['output']>;
  deleteOrder?: Maybe<Scalars['Boolean']['output']>;
  deleteQuestion?: Maybe<Scalars['Boolean']['output']>;
  deleteReview?: Maybe<Scalars['Boolean']['output']>;
  deleteSample?: Maybe<Scalars['Boolean']['output']>;
  deleteSeason?: Maybe<Scalars['Boolean']['output']>;
  deleteSizeGroup?: Maybe<Scalars['Boolean']['output']>;
  deleteTask?: Maybe<Scalars['Boolean']['output']>;
  deleteUser?: Maybe<Scalars['Boolean']['output']>;
  deleteWorkshop?: Maybe<Workshop>;
  generateDesignFromText?: Maybe<Sample>;
  generateSampleDesign?: Maybe<Sample>;
  holdSample?: Maybe<Sample>;
  likeCollection?: Maybe<UserFavoriteCollection>;
  login?: Maybe<Scalars['JSON']['output']>;
  logout?: Maybe<Scalars['Boolean']['output']>;
  markAllNotificationsAsRead?: Maybe<Scalars['Int']['output']>;
  markNotificationAsRead?: Maybe<Notification>;
  publishCollection?: Maybe<Scalars['Boolean']['output']>;
  resetUserPassword?: Maybe<User>;
  resumeSample?: Maybe<Sample>;
  revertProductionStage?: Maybe<ProductionTracking>;
  sendMessage?: Maybe<Message>;
  signup?: Maybe<Scalars['JSON']['output']>;
  unlikeCollection?: Maybe<UserFavoriteCollection>;
  updateCategory?: Maybe<Category>;
  updateCertification?: Maybe<Certification>;
  updateCollection?: Maybe<Collection>;
  updateColor?: Maybe<Color>;
  updateCompany?: Maybe<Company>;
  updateCustomerOrder?: Maybe<Order>;
  updateFabric?: Maybe<Fabric>;
  updateFit?: Maybe<FitItem>;
  updateOrder?: Maybe<Order>;
  updateOrderStatus?: Maybe<Order>;
  updateProductionStage?: Maybe<ProductionTracking>;
  updateProfile?: Maybe<User>;
  updateReview?: Maybe<Review>;
  updateSample?: Maybe<Sample>;
  updateSampleStatus?: Maybe<Sample>;
  updateSeason?: Maybe<SeasonItem>;
  updateSizeGroup?: Maybe<SizeGroup>;
  updateTask?: Maybe<Task>;
  updateUser?: Maybe<User>;
  updateUserRole?: Maybe<User>;
  updateWorkshop?: Maybe<Workshop>;
  uploadFile?: Maybe<Scalars['JSON']['output']>;
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
export type MutationCreateCertificationArgs = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  issuer?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  validFrom?: InputMaybe<Scalars['String']['input']>;
  validUntil?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationCreateCollectionArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  season?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationCreateColorArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  code: Scalars['String']['input'];
  companyId?: InputMaybe<Scalars['Int']['input']>;
  hexValue?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationCreateCompanyArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationCreateFabricArgs = {
  careInstructions?: InputMaybe<Scalars['String']['input']>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
  material?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
  weight?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationCreateFitArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
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
  collectionId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationCreateSeasonArgs = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  fullName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  startDate?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  year: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationCreateSizeGroupArgs = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  sizes: Scalars['String']['input'];
  standard?: InputMaybe<Scalars['String']['input']>;
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
export type MutationCreateUserArgs = {
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
export type MutationDeleteCertificationArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteCollectionArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteColorArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteFabricArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteFitArgs = {
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
export type MutationDeleteSeasonArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteSizeGroupArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteTaskArgs = {
  id: Scalars['Int']['input'];
};


/** Root Mutation */
export type MutationDeleteUserArgs = {
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
export type MutationPublishCollectionArgs = {
  id: Scalars['Int']['input'];
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
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
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
export type MutationUpdateCertificationArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  issuer?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  validFrom?: InputMaybe<Scalars['String']['input']>;
  validUntil?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationUpdateCollectionArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationUpdateColorArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  hexValue?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationUpdateCompanyArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
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
export type MutationUpdateFabricArgs = {
  careInstructions?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  material?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationUpdateFitArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationUpdateOrderArgs = {
  id: Scalars['Int']['input'];
  quantity?: InputMaybe<Scalars['Int']['input']>;
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
  department?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  jobTitle?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationUpdateReviewArgs = {
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  rating?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Mutation */
export type MutationUpdateSampleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


/** Root Mutation */
export type MutationUpdateSampleStatusArgs = {
  id: Scalars['Int']['input'];
  status: Scalars['String']['input'];
};


/** Root Mutation */
export type MutationUpdateSeasonArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};


/** Root Mutation */
export type MutationUpdateSizeGroupArgs = {
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  sizes?: InputMaybe<Scalars['String']['input']>;
  standard?: InputMaybe<Scalars['String']['input']>;
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
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
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

export type Notification = {
  __typename?: 'Notification';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isRead?: Maybe<Scalars['Boolean']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

export type Order = {
  __typename?: 'Order';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  orderNumber?: Maybe<Scalars['String']['output']>;
  quantity?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  totalPrice?: Maybe<Scalars['Float']['output']>;
  unitPrice?: Maybe<Scalars['Float']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
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

/** Root Query */
export type Query = {
  __typename?: 'Query';
  allCategories?: Maybe<Array<Category>>;
  allCompanies?: Maybe<Array<Company>>;
  allManufacturers?: Maybe<Array<User>>;
  allProductionTracking?: Maybe<Array<ProductionTracking>>;
  assignedOrders?: Maybe<QueryAssignedOrdersConnection>;
  assignedSamples?: Maybe<QueryAssignedSamplesConnection>;
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
  dashboardStats?: Maybe<Scalars['JSON']['output']>;
  featuredCollections?: Maybe<Array<Collection>>;
  manufacturerOrders?: Maybe<QueryManufacturerOrdersConnection>;
  me?: Maybe<User>;
  message?: Maybe<Message>;
  messages?: Maybe<Array<Message>>;
  myCategories?: Maybe<QueryMyCategoriesConnection>;
  myCertifications?: Maybe<Array<Certification>>;
  myColors?: Maybe<Array<Color>>;
  myCompany?: Maybe<Company>;
  myFabrics?: Maybe<Array<Fabric>>;
  myReviews?: Maybe<QueryMyReviewsConnection>;
  mySizeGroups?: Maybe<Array<SizeGroup>>;
  myTasks?: Maybe<Array<Task>>;
  myWorkshops?: Maybe<Array<Workshop>>;
  notifications?: Maybe<Array<Notification>>;
  order?: Maybe<Order>;
  orderTasks?: Maybe<QueryOrderTasksConnection>;
  orders?: Maybe<Array<Order>>;
  pendingReviews?: Maybe<QueryPendingReviewsConnection>;
  pendingTasks?: Maybe<Array<Task>>;
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
  task?: Maybe<Task>;
  taskAnalytics?: Maybe<Scalars['JSON']['output']>;
  unreadNotificationCount?: Maybe<Scalars['Int']['output']>;
  user?: Maybe<User>;
  userStats?: Maybe<Scalars['JSON']['output']>;
  users?: Maybe<Array<User>>;
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
export type QueryFeaturedCollectionsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
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
export type QueryTaskArgs = {
  id: Scalars['Int']['input'];
};


/** Root Query */
export type QueryUserArgs = {
  id: Scalars['Int']['input'];
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

export type Review = {
  __typename?: 'Review';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isApproved?: Maybe<Scalars['Boolean']['output']>;
  rating?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Sample = {
  __typename?: 'Sample';
  aiGenerated?: Maybe<Scalars['Boolean']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  sampleNumber?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type SeasonItem = {
  __typename?: 'SeasonItem';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
};

export type SizeGroup = {
  __typename?: 'SizeGroup';
  category?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  sizes?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

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

export type User = {
  __typename?: 'User';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  department?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type UserFavoriteCollection = {
  __typename?: 'UserFavoriteCollection';
  collectionId?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
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

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id?: string | null, email?: string | null, name?: string | null, role?: string | null } | null };

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login?: any | null };


export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}]}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;