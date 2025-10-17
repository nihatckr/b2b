import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type AiAnalysis = {
  __typename?: 'AIAnalysis';
  costAnalysis?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
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
  id: Scalars['Int']['output'];
  qualityAnalysis?: Maybe<Scalars['String']['output']>;
  qualityScore?: Maybe<Scalars['Float']['output']>;
  salesPotential?: Maybe<Scalars['String']['output']>;
  sample?: Maybe<Sample>;
  sampleId: Scalars['Int']['output'];
  suggestedMinOrder?: Maybe<Scalars['Int']['output']>;
  targetMarket?: Maybe<Scalars['String']['output']>;
  technicalDescription?: Maybe<Scalars['String']['output']>;
  trendAnalysis?: Maybe<Scalars['String']['output']>;
  trendScore?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type AiAnalysisInput = {
  costAnalysis?: InputMaybe<Scalars['String']['input']>;
  designFocus?: InputMaybe<Scalars['String']['input']>;
  designStyle?: InputMaybe<Scalars['String']['input']>;
  designSuggestions?: InputMaybe<Scalars['String']['input']>;
  detectedAccessories?: InputMaybe<Scalars['String']['input']>;
  detectedClassification?: InputMaybe<Scalars['String']['input']>;
  detectedColor?: InputMaybe<Scalars['String']['input']>;
  detectedFabric?: InputMaybe<Scalars['String']['input']>;
  detectedGender?: InputMaybe<Scalars['String']['input']>;
  detectedPattern?: InputMaybe<Scalars['String']['input']>;
  detectedProduct?: InputMaybe<Scalars['String']['input']>;
  estimatedCostMax?: InputMaybe<Scalars['Float']['input']>;
  estimatedCostMin?: InputMaybe<Scalars['Float']['input']>;
  qualityAnalysis?: InputMaybe<Scalars['String']['input']>;
  qualityScore?: InputMaybe<Scalars['Float']['input']>;
  salesPotential?: InputMaybe<Scalars['String']['input']>;
  suggestedMinOrder?: InputMaybe<Scalars['Int']['input']>;
  targetMarket?: InputMaybe<Scalars['String']['input']>;
  technicalDescription?: InputMaybe<Scalars['String']['input']>;
  trendAnalysis?: InputMaybe<Scalars['String']['input']>;
  trendScore?: InputMaybe<Scalars['Float']['input']>;
};

export type AnswerQuestionInput = {
  answer: Scalars['String']['input'];
  id: Scalars['Int']['input'];
};

export type ApproveReviewInput = {
  id: Scalars['Int']['input'];
  isApproved: Scalars['Boolean']['input'];
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

export type Category = {
  __typename?: 'Category';
  author?: Maybe<User>;
  collectionsCount?: Maybe<Scalars['Int']['output']>;
  company?: Maybe<Company>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  parentCategory?: Maybe<Category>;
  subCategories?: Maybe<Array<Maybe<Category>>>;
  updatedAt: Scalars['String']['output'];
};

export type CategoryBreakdown = {
  __typename?: 'CategoryBreakdown';
  category: Scalars['String']['output'];
  count: Scalars['Int']['output'];
  men: Scalars['Int']['output'];
  unisex: Scalars['Int']['output'];
  women: Scalars['Int']['output'];
};

export type Certification = {
  __typename?: 'Certification';
  category: CertificationCategory;
  certificateFile?: Maybe<Scalars['String']['output']>;
  certificateNumber?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  collections?: Maybe<Array<Maybe<Collection>>>;
  company: Company;
  companyId: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  issuer?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  validFrom?: Maybe<Scalars['DateTime']['output']>;
  validUntil?: Maybe<Scalars['DateTime']['output']>;
};

/** Certification categories for products */
export enum CertificationCategory {
  Chemical = 'CHEMICAL',
  Environmental = 'ENVIRONMENTAL',
  Fiber = 'FIBER',
  Social = 'SOCIAL',
  Traceability = 'TRACEABILITY'
}

export type Collection = {
  __typename?: 'Collection';
  accessories?: Maybe<Scalars['String']['output']>;
  author?: Maybe<User>;
  category?: Maybe<Category>;
  certifications?: Maybe<Array<Maybe<Certification>>>;
  colors?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  company?: Maybe<Company>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  fabricComposition?: Maybe<Scalars['String']['output']>;
  favoritedBy?: Maybe<Array<Maybe<User>>>;
  fit?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Gender>;
  id: Scalars['Int']['output'];
  images?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  isActive: Scalars['Boolean']['output'];
  isFeatured: Scalars['Boolean']['output'];
  likesCount: Scalars['Int']['output'];
  measurementChart?: Maybe<Scalars['String']['output']>;
  modelCode: Scalars['String']['output'];
  moq?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  ordersCount?: Maybe<Scalars['Int']['output']>;
  price: Scalars['Float']['output'];
  productionSchedule?: Maybe<Scalars['String']['output']>;
  samples?: Maybe<Array<Maybe<Sample>>>;
  samplesCount?: Maybe<Scalars['Int']['output']>;
  season?: Maybe<Season>;
  sizeGroupIds?: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
  sizeRange?: Maybe<Scalars['String']['output']>;
  sku?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  stock: Scalars['Int']['output'];
  targetLeadTime?: Maybe<Scalars['Int']['output']>;
  targetPrice?: Maybe<Scalars['Float']['output']>;
  techPack?: Maybe<Scalars['String']['output']>;
  trend?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CollectionGenderBreakdown = {
  __typename?: 'CollectionGenderBreakdown';
  men: Scalars['Int']['output'];
  unisex: Scalars['Int']['output'];
  women: Scalars['Int']['output'];
};

export type Color = {
  __typename?: 'Color';
  code?: Maybe<Scalars['String']['output']>;
  company?: Maybe<Company>;
  createdAt: Scalars['DateTime']['output'];
  hexCode?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Company = {
  __typename?: 'Company';
  address?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  employees?: Maybe<Array<Maybe<User>>>;
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  location?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<User>;
  ownerId?: Maybe<Scalars['Int']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  settings?: Maybe<Scalars['String']['output']>;
  type: CompanyType;
  updatedAt: Scalars['String']['output'];
  users?: Maybe<Array<Maybe<User>>>;
  website?: Maybe<Scalars['String']['output']>;
};

/** Company signup action */
export enum CompanyAction {
  CreateNew = 'CREATE_NEW',
  JoinExisting = 'JOIN_EXISTING'
}

export type CompanyCreateInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type CompanyFlowInput = {
  action: CompanyAction;
  companyAddress?: InputMaybe<Scalars['String']['input']>;
  companyEmail?: InputMaybe<Scalars['String']['input']>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
  companyName?: InputMaybe<Scalars['String']['input']>;
  companyPhone?: InputMaybe<Scalars['String']['input']>;
  companyType?: InputMaybe<CompanyType>;
  companyWebsite?: InputMaybe<Scalars['String']['input']>;
  inviteCode?: InputMaybe<Scalars['String']['input']>;
};

/** Type of company (manufacturer/buyer) */
export enum CompanyType {
  Both = 'BOTH',
  Buyer = 'BUYER',
  Manufacturer = 'MANUFACTURER'
}

export type CompanyUpdateInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type CountrySuppliers = {
  __typename?: 'CountrySuppliers';
  companies?: Maybe<Array<Maybe<SupplierInfo>>>;
  count: Scalars['Int']['output'];
  country: Scalars['String']['output'];
};

export type CreateCategoryInput = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentCategoryId?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateCollectionInput = {
  accessories?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  colors?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  fabricComposition?: InputMaybe<Scalars['String']['input']>;
  fit?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Gender>;
  images?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  measurementChart?: InputMaybe<Scalars['String']['input']>;
  modelCode?: InputMaybe<Scalars['String']['input']>;
  moq?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  productionSchedule?: InputMaybe<Scalars['String']['input']>;
  season?: InputMaybe<Season>;
  sizeGroupIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  sizeRange?: InputMaybe<Scalars['String']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  stock?: InputMaybe<Scalars['Int']['input']>;
  targetLeadTime?: InputMaybe<Scalars['Int']['input']>;
  targetPrice?: InputMaybe<Scalars['Float']['input']>;
  techPack?: InputMaybe<Scalars['String']['input']>;
  trend?: InputMaybe<Scalars['String']['input']>;
};

export type CreateColorInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  hexCode?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};

export type CreateCompanyInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  location?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type CreateFabricInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  composition: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  leadTime?: InputMaybe<Scalars['Int']['input']>;
  minOrder?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  price?: InputMaybe<Scalars['Float']['input']>;
  supplier?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Int']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateMessageInput = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  content: Scalars['String']['input'];
  receiver?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrderInput = {
  collectionId: Scalars['Int']['input'];
  companyId?: InputMaybe<Scalars['Int']['input']>;
  estimatedDelivery?: InputMaybe<Scalars['DateTime']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  quantity: Scalars['Int']['input'];
  specifications?: InputMaybe<Scalars['String']['input']>;
  unitPrice: Scalars['Float']['input'];
};

export type CreateProductionTrackingInput = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  orderId?: InputMaybe<Scalars['Int']['input']>;
  sampleId?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateQualityControlInput = {
  fabricDefects?: InputMaybe<Scalars['Boolean']['input']>;
  finishingDefects?: InputMaybe<Scalars['Boolean']['input']>;
  measureDefects?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  productionId: Scalars['Int']['input'];
  result: QualityResult;
  score?: InputMaybe<Scalars['Int']['input']>;
  sewingDefects?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateQuestionInput = {
  collectionId: Scalars['Int']['input'];
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  question: Scalars['String']['input'];
};

export type CreateReviewInput = {
  collectionId: Scalars['Int']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  rating: Scalars['Int']['input'];
};

export type CreateSampleInput = {
  aiAnalysis?: InputMaybe<AiAnalysisInput>;
  aiGenerated?: InputMaybe<Scalars['Boolean']['input']>;
  aiSketchUrl?: InputMaybe<Scalars['String']['input']>;
  collectionId?: InputMaybe<Scalars['Int']['input']>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
  customDesignImages?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  customerNote?: InputMaybe<Scalars['String']['input']>;
  deliveryAddress?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  manufactureId?: InputMaybe<Scalars['Int']['input']>;
  originalCollectionId?: InputMaybe<Scalars['Int']['input']>;
  revisionRequests?: InputMaybe<Scalars['String']['input']>;
  sampleType: SampleType;
};

export type CreateSizeGroupInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  sizes: Array<Scalars['String']['input']>;
};

export type CreateWorkshopInput = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  type: WorkshopType;
};

export type DashboardStats = {
  __typename?: 'DashboardStats';
  activeOrders: Scalars['Int']['output'];
  activeProductions: Scalars['Int']['output'];
  activeSamples: Scalars['Int']['output'];
  completedOrders: Scalars['Int']['output'];
  completedProductions: Scalars['Int']['output'];
  completedSamples: Scalars['Int']['output'];
  failedQC: Scalars['Int']['output'];
  monthlyStats?: Maybe<Array<Maybe<MonthlyStats>>>;
  passedQC: Scalars['Int']['output'];
  pendingOrders: Scalars['Int']['output'];
  pendingSamples: Scalars['Int']['output'];
  qcPassRate: Scalars['Float']['output'];
  recentOrders?: Maybe<Array<Maybe<Order>>>;
  recentProductions?: Maybe<Array<Maybe<ProductionTracking>>>;
  recentSamples?: Maybe<Array<Maybe<Sample>>>;
  totalCollections: Scalars['Int']['output'];
  totalMessages: Scalars['Int']['output'];
  totalOrders: Scalars['Int']['output'];
  totalProductions: Scalars['Int']['output'];
  totalSamples: Scalars['Int']['output'];
  unreadMessages: Scalars['Int']['output'];
};

export type Fabric = {
  __typename?: 'Fabric';
  code?: Maybe<Scalars['String']['output']>;
  company?: Maybe<Company>;
  composition: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  leadTime?: Maybe<Scalars['Int']['output']>;
  minOrder?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  supplier?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  weight?: Maybe<Scalars['Int']['output']>;
  width?: Maybe<Scalars['Int']['output']>;
};

export type File = {
  __typename?: 'File';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  encoding?: Maybe<Scalars['String']['output']>;
  filename: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  mimetype: Scalars['String']['output'];
  path: Scalars['String']['output'];
  size: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Clothing fit types */
export enum Fit {
  Fitted = 'FITTED',
  Loose = 'LOOSE',
  Oversized = 'OVERSIZED',
  Regular = 'REGULAR',
  Relaxed = 'RELAXED',
  Slim = 'SLIM'
}

export type FitItem = {
  __typename?: 'FitItem';
  category?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  company?: Maybe<Company>;
  companyId: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Target gender for products */
export enum Gender {
  Boys = 'BOYS',
  Girls = 'GIRLS',
  Men = 'MEN',
  Unisex = 'UNISEX',
  Women = 'WOMEN'
}

export type GrowthMetrics = {
  __typename?: 'GrowthMetrics';
  avgDeliveryDays: Scalars['Float']['output'];
  customerSatisfactionRate: Scalars['Float']['output'];
  monthlyGrowthRate: Scalars['Float']['output'];
  totalTransactionVolume: Scalars['Int']['output'];
};

export type LatestCollection = {
  __typename?: 'LatestCollection';
  createdAt: Scalars['String']['output'];
  gender: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Message = {
  __typename?: 'Message';
  company?: Maybe<Company>;
  companyId?: Maybe<Scalars['Int']['output']>;
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  isRead: Scalars['Boolean']['output'];
  receiver?: Maybe<Scalars['String']['output']>;
  sender?: Maybe<User>;
  senderId: Scalars['Int']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type MessageFilterInput = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

export type MonthlyStats = {
  __typename?: 'MonthlyStats';
  completedProductions: Scalars['Int']['output'];
  month: Scalars['String']['output'];
  orders: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
  samples: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addProductionStageUpdate?: Maybe<ProductionStageUpdate>;
  analyzeProductWithOllama?: Maybe<ProductAnalysisResult>;
  answerQuestion?: Maybe<Question>;
  approveReview?: Maybe<Review>;
  approveSample?: Maybe<Sample>;
  askQuestion?: Maybe<Question>;
  assignWorkshopToProduction?: Maybe<ProductionTracking>;
  cancelOrder?: Maybe<Order>;
  cancelSample?: Maybe<Sample>;
  changePassword?: Maybe<Scalars['Boolean']['output']>;
  checkOllamaStatus?: Maybe<OllamaStatus>;
  checkProductionDeadlines: Scalars['Boolean']['output'];
  completeProductionStage?: Maybe<ProductionTracking>;
  createCategory?: Maybe<Category>;
  createCertification?: Maybe<Certification>;
  createCollection?: Maybe<Collection>;
  createColor?: Maybe<Color>;
  createCompany?: Maybe<Company>;
  createFabric?: Maybe<Fabric>;
  createFit?: Maybe<FitItem>;
  createNotification?: Maybe<Notification>;
  createOrder?: Maybe<Order>;
  createReview?: Maybe<Review>;
  createSample?: Maybe<Sample>;
  createSeason?: Maybe<SeasonItem>;
  createSizeGroup?: Maybe<SizeGroup>;
  createUser?: Maybe<User>;
  createWorkshop?: Maybe<Workshop>;
  deleteCategory?: Maybe<Category>;
  deleteCertification?: Maybe<Certification>;
  deleteCollection?: Maybe<Collection>;
  deleteColor?: Maybe<Color>;
  deleteCompany?: Maybe<Company>;
  deleteFabric?: Maybe<Fabric>;
  deleteFit?: Maybe<FitItem>;
  deleteMessage?: Maybe<Message>;
  deleteNotification?: Maybe<Notification>;
  deleteOrder?: Maybe<Order>;
  deleteQuestion?: Maybe<Question>;
  deleteReview?: Maybe<Review>;
  deleteSample?: Maybe<Sample>;
  deleteSeason?: Maybe<SeasonItem>;
  deleteSizeGroup?: Maybe<SizeGroup>;
  deleteUser?: Maybe<User>;
  deleteWorkshop?: Maybe<Workshop>;
  generateDesignFromText?: Maybe<Sample>;
  generateSampleDesign?: Maybe<Sample>;
  holdSample?: Maybe<Sample>;
  login?: Maybe<AuthPayload>;
  logout?: Maybe<Scalars['Boolean']['output']>;
  markAllNotificationsAsRead: Scalars['Int']['output'];
  markMessageAsRead?: Maybe<Message>;
  markNotificationAsRead?: Maybe<Notification>;
  resetUserPassword?: Maybe<User>;
  resumeSample?: Maybe<Sample>;
  revertProductionStage?: Maybe<ProductionTracking>;
  sendMessage?: Maybe<Message>;
  signup?: Maybe<AuthPayload>;
  toggleFavoriteCollection?: Maybe<Collection>;
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
  updateSample?: Maybe<Sample>;
  updateSampleStatus?: Maybe<Sample>;
  updateSeason?: Maybe<SeasonItem>;
  updateSizeGroup?: Maybe<SizeGroup>;
  updateUser?: Maybe<User>;
  updateUserRole?: Maybe<User>;
  updateWorkshop?: Maybe<Workshop>;
};


export type MutationAddProductionStageUpdateArgs = {
  delayReason?: InputMaybe<Scalars['String']['input']>;
  extraDays?: InputMaybe<Scalars['Int']['input']>;
  hasDelay: Scalars['Boolean']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  photos?: InputMaybe<Scalars['String']['input']>;
  productionId: Scalars['Int']['input'];
  stage: ProductionStage;
};


export type MutationAnalyzeProductWithOllamaArgs = {
  imageUrl: Scalars['String']['input'];
  userNotes?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAnswerQuestionArgs = {
  input: AnswerQuestionInput;
};


export type MutationApproveReviewArgs = {
  input: ApproveReviewInput;
};


export type MutationApproveSampleArgs = {
  approve: Scalars['Boolean']['input'];
  estimatedDays?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['Int']['input'];
  manufacturerNote?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAskQuestionArgs = {
  input: CreateQuestionInput;
};


export type MutationAssignWorkshopToProductionArgs = {
  packagingWorkshopId?: InputMaybe<Scalars['Int']['input']>;
  productionId: Scalars['Int']['input'];
  sewingWorkshopId?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationCancelOrderArgs = {
  id: Scalars['Int']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCancelSampleArgs = {
  id: Scalars['Int']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};


export type MutationCompleteProductionStageArgs = {
  productionId: Scalars['Int']['input'];
  stage: ProductionStage;
};


export type MutationCreateCategoryArgs = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentCategoryId?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationCreateCertificationArgs = {
  category: CertificationCategory;
  certificateFile?: InputMaybe<Scalars['String']['input']>;
  certificateNumber?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  issuer?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  validFrom?: InputMaybe<Scalars['DateTime']['input']>;
  validUntil?: InputMaybe<Scalars['DateTime']['input']>;
};


export type MutationCreateCollectionArgs = {
  input: CreateCollectionInput;
};


export type MutationCreateColorArgs = {
  input: CreateColorInput;
};


export type MutationCreateCompanyArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateFabricArgs = {
  input: CreateFabricInput;
};


export type MutationCreateFitArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateNotificationArgs = {
  link?: InputMaybe<Scalars['String']['input']>;
  message: Scalars['String']['input'];
  orderId?: InputMaybe<Scalars['Int']['input']>;
  productionTrackingId?: InputMaybe<Scalars['Int']['input']>;
  sampleId?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
  type: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
};


export type MutationCreateOrderArgs = {
  collectionId: Scalars['Int']['input'];
  companyId?: InputMaybe<Scalars['Int']['input']>;
  customerNote?: InputMaybe<Scalars['String']['input']>;
  deliveryAddress?: InputMaybe<Scalars['String']['input']>;
  estimatedDelivery?: InputMaybe<Scalars['DateTime']['input']>;
  manufactureId?: InputMaybe<Scalars['Int']['input']>;
  quantity: Scalars['Int']['input'];
  unitPrice?: InputMaybe<Scalars['Float']['input']>;
};


export type MutationCreateReviewArgs = {
  input: CreateReviewInput;
};


export type MutationCreateSampleArgs = {
  input: CreateSampleInput;
};


export type MutationCreateSeasonArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  fullName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  type: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};


export type MutationCreateSizeGroupArgs = {
  input: CreateSizeGroupInput;
};


export type MutationCreateUserArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role: Role;
};


export type MutationCreateWorkshopArgs = {
  input: CreateWorkshopInput;
};


export type MutationDeleteCategoryArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteCertificationArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteCollectionArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteColorArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteCompanyArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteFabricArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteFitArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteMessageArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteNotificationArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteOrderArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteQuestionArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteReviewArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteSampleArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteSeasonArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteSizeGroupArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteWorkshopArgs = {
  id: Scalars['Int']['input'];
};


export type MutationGenerateDesignFromTextArgs = {
  cfgScale?: InputMaybe<Scalars['Float']['input']>;
  collectionId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  negativePrompt?: InputMaybe<Scalars['String']['input']>;
  prompt: Scalars['String']['input'];
  sampleName?: InputMaybe<Scalars['String']['input']>;
  steps?: InputMaybe<Scalars['Int']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
  workflowName?: InputMaybe<Scalars['String']['input']>;
};


export type MutationGenerateSampleDesignArgs = {
  cfgScale?: InputMaybe<Scalars['Float']['input']>;
  collectionId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  negativePrompt?: InputMaybe<Scalars['String']['input']>;
  prompt: Scalars['String']['input'];
  sampleName?: InputMaybe<Scalars['String']['input']>;
  sketchUrl: Scalars['String']['input'];
  steps?: InputMaybe<Scalars['Int']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationHoldSampleArgs = {
  id: Scalars['Int']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMarkMessageAsReadArgs = {
  id: Scalars['Int']['input'];
};


export type MutationMarkNotificationAsReadArgs = {
  id: Scalars['Int']['input'];
};


export type MutationResetUserPasswordArgs = {
  newPassword: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
};


export type MutationResumeSampleArgs = {
  id: Scalars['Int']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRevertProductionStageArgs = {
  productionId?: InputMaybe<Scalars['Int']['input']>;
  targetStage?: InputMaybe<ProductionStage>;
};


export type MutationSendMessageArgs = {
  input: CreateMessageInput;
};


export type MutationSignupArgs = {
  input: SignupInput;
};


export type MutationToggleFavoriteCollectionArgs = {
  collectionId: Scalars['Int']['input'];
};


export type MutationUpdateCategoryArgs = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  parentCategoryId?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationUpdateCertificationArgs = {
  category?: InputMaybe<CertificationCategory>;
  certificateFile?: InputMaybe<Scalars['String']['input']>;
  certificateNumber?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  issuer?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  validFrom?: InputMaybe<Scalars['DateTime']['input']>;
  validUntil?: InputMaybe<Scalars['DateTime']['input']>;
};


export type MutationUpdateCollectionArgs = {
  input: UpdateCollectionInput;
};


export type MutationUpdateColorArgs = {
  input: UpdateColorInput;
};


export type MutationUpdateCompanyArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateCustomerOrderArgs = {
  customerNote?: InputMaybe<Scalars['String']['input']>;
  deliveryAddress?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  quantity?: InputMaybe<Scalars['Int']['input']>;
  unitPrice?: InputMaybe<Scalars['Float']['input']>;
};


export type MutationUpdateFabricArgs = {
  input: UpdateFabricInput;
};


export type MutationUpdateFitArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateOrderArgs = {
  estimatedProductionDate?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['Int']['input'];
  manufacturerResponse?: InputMaybe<Scalars['String']['input']>;
  productionDays?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<OrderStatus>;
};


export type MutationUpdateOrderStatusArgs = {
  estimatedDays?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['Int']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  quotedPrice?: InputMaybe<Scalars['Float']['input']>;
  status: OrderStatus;
};


export type MutationUpdateProductionStageArgs = {
  input: UpdateProductionStageInput;
};


export type MutationUpdateProfileArgs = {
  input: UserUpdateInput;
};


export type MutationUpdateSampleArgs = {
  input: UpdateSampleInput;
};


export type MutationUpdateSampleStatusArgs = {
  input: UpdateSampleStatusInput;
};


export type MutationUpdateSeasonArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationUpdateSizeGroupArgs = {
  input: UpdateSizeGroupInput;
};


export type MutationUpdateUserArgs = {
  input: UserUpdateInput;
};


export type MutationUpdateUserRoleArgs = {
  role: Role;
  userId: Scalars['Int']['input'];
};


export type MutationUpdateWorkshopArgs = {
  input: UpdateWorkshopInput;
};

export type Notification = {
  __typename?: 'Notification';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  isRead: Scalars['Boolean']['output'];
  link?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  order?: Maybe<Order>;
  orderId?: Maybe<Scalars['Int']['output']>;
  productionTracking?: Maybe<ProductionTracking>;
  productionTrackingId?: Maybe<Scalars['Int']['output']>;
  sample?: Maybe<Sample>;
  sampleId?: Maybe<Scalars['Int']['output']>;
  title: Scalars['String']['output'];
  type: NotificationType;
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId: Scalars['Int']['output'];
};

/** Type of notification */
export enum NotificationType {
  Message = 'MESSAGE',
  Order = 'ORDER',
  Production = 'PRODUCTION',
  Quality = 'QUALITY',
  Sample = 'SAMPLE',
  System = 'SYSTEM'
}

export type OllamaStatus = {
  __typename?: 'OllamaStatus';
  availableModels: Array<Scalars['String']['output']>;
  modelAvailable: Scalars['Boolean']['output'];
  running: Scalars['Boolean']['output'];
};

export type Order = {
  __typename?: 'Order';
  actualProductionEnd?: Maybe<Scalars['DateTime']['output']>;
  actualProductionStart?: Maybe<Scalars['DateTime']['output']>;
  cargoTrackingNumber?: Maybe<Scalars['String']['output']>;
  collection?: Maybe<Collection>;
  company?: Maybe<Company>;
  createdAt: Scalars['DateTime']['output'];
  customer?: Maybe<User>;
  customerNote?: Maybe<Scalars['String']['output']>;
  deliveryAddress?: Maybe<Scalars['String']['output']>;
  estimatedProductionDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Int']['output'];
  manufacture?: Maybe<User>;
  manufacturerResponse?: Maybe<Scalars['String']['output']>;
  orderNumber: Scalars['String']['output'];
  productionDays?: Maybe<Scalars['Int']['output']>;
  productionHistory?: Maybe<Array<Maybe<OrderProduction>>>;
  productionTracking?: Maybe<Array<Maybe<ProductionTracking>>>;
  quantity: Scalars['Int']['output'];
  shippingDate?: Maybe<Scalars['DateTime']['output']>;
  specifications?: Maybe<Scalars['String']['output']>;
  status: OrderStatus;
  totalPrice: Scalars['Float']['output'];
  unitPrice: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type OrderProduction = {
  __typename?: 'OrderProduction';
  actualDate?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  estimatedDays?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  note?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Order>;
  status: OrderStatus;
  updatedBy?: Maybe<User>;
};

/** Status workflow for order production */
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

export type PlatformFeature = {
  __typename?: 'PlatformFeature';
  description: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ProductAnalysisResult = {
  __typename?: 'ProductAnalysisResult';
  category: Scalars['String']['output'];
  colors: Array<Scalars['String']['output']>;
  designPrompt: Scalars['String']['output'];
  details: Array<Scalars['String']['output']>;
  fit?: Maybe<Scalars['String']['output']>;
  material: Scalars['String']['output'];
  neckline?: Maybe<Scalars['String']['output']>;
  pattern: Scalars['String']['output'];
  productType: Scalars['String']['output'];
  rawResponse?: Maybe<Scalars['String']['output']>;
  sleeves?: Maybe<Scalars['String']['output']>;
  style: Scalars['String']['output'];
  suggestedModels: Array<SuggestedModel>;
};

export type ProductionAnalytics = {
  __typename?: 'ProductionAnalytics';
  avgProductionDays: Scalars['Int']['output'];
  stageBreakdown: Array<Maybe<StageBreakdown>>;
  totalCompleted: Scalars['Int']['output'];
  totalInProgress: Scalars['Int']['output'];
};

/** 7-stage production process */
export enum ProductionStage {
  Cutting = 'CUTTING',
  Fabric = 'FABRIC',
  Packaging = 'PACKAGING',
  Planning = 'PLANNING',
  Quality = 'QUALITY',
  Sewing = 'SEWING',
  Shipping = 'SHIPPING'
}

export type ProductionStageUpdate = {
  __typename?: 'ProductionStageUpdate';
  actualEndDate?: Maybe<Scalars['String']['output']>;
  actualStartDate?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  estimatedDays?: Maybe<Scalars['Int']['output']>;
  extraDays: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  isRevision: Scalars['Boolean']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  photos?: Maybe<Scalars['String']['output']>;
  productionId: Scalars['Int']['output'];
  stage: ProductionStage;
  status: StageStatus;
};

/** Overall production status */
export enum ProductionStatus {
  Blocked = 'BLOCKED',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  Waiting = 'WAITING'
}

export type ProductionTracking = {
  __typename?: 'ProductionTracking';
  actualEndDate?: Maybe<Scalars['String']['output']>;
  actualStartDate?: Maybe<Scalars['String']['output']>;
  companyId?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['String']['output'];
  currentStage: ProductionStage;
  estimatedEndDate?: Maybe<Scalars['String']['output']>;
  estimatedStartDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Order>;
  orderId?: Maybe<Scalars['Int']['output']>;
  overallStatus: ProductionStatus;
  packagingWorkshopId?: Maybe<Scalars['Int']['output']>;
  progress: Scalars['Int']['output'];
  qualityControls?: Maybe<Array<Maybe<QualityControl>>>;
  sample?: Maybe<Sample>;
  sampleId?: Maybe<Scalars['Int']['output']>;
  sewingWorkshopId?: Maybe<Scalars['Int']['output']>;
  stageUpdates?: Maybe<Array<Maybe<ProductionStageUpdate>>>;
  updatedAt: Scalars['String']['output'];
};

export type PublicPlatformStats = {
  __typename?: 'PublicPlatformStats';
  activeManufacturers: Scalars['Int']['output'];
  activeWorkshops: Scalars['Int']['output'];
  collectionsByCategory?: Maybe<Array<Maybe<CategoryBreakdown>>>;
  collectionsByGender: CollectionGenderBreakdown;
  growthMetrics: GrowthMetrics;
  platformFeatures?: Maybe<Array<Maybe<PlatformFeature>>>;
  recentActivity: RecentActivity;
  suppliersByCountry?: Maybe<Array<Maybe<CountrySuppliers>>>;
  sustainability: SustainabilityMetrics;
  testimonials?: Maybe<Array<Maybe<Testimonial>>>;
  totalCollections: Scalars['Int']['output'];
  totalOrders: Scalars['Int']['output'];
  totalProducts: Scalars['Int']['output'];
};

export type QualityControl = {
  __typename?: 'QualityControl';
  checkDate: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  fabricDefects: Scalars['Boolean']['output'];
  finishingDefects: Scalars['Boolean']['output'];
  id: Scalars['Int']['output'];
  inspector?: Maybe<User>;
  inspectorId: Scalars['Int']['output'];
  measureDefects: Scalars['Boolean']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  photos?: Maybe<Scalars['String']['output']>;
  productionId: Scalars['Int']['output'];
  result: QualityResult;
  score?: Maybe<Scalars['Int']['output']>;
  sewingDefects: Scalars['Boolean']['output'];
};

/** Quality control test results */
export enum QualityResult {
  ConditionalPass = 'CONDITIONAL_PASS',
  Failed = 'FAILED',
  Passed = 'PASSED',
  Pending = 'PENDING'
}

export type Query = {
  __typename?: 'Query';
  allCategories?: Maybe<Array<Maybe<Category>>>;
  allCompanies?: Maybe<Array<Maybe<Company>>>;
  allManufacturers?: Maybe<Array<Maybe<User>>>;
  allProductionTracking?: Maybe<Array<Maybe<ProductionTracking>>>;
  allUsers: Array<User>;
  assignedOrders?: Maybe<Array<Maybe<Order>>>;
  assignedSamples?: Maybe<Array<Maybe<Sample>>>;
  categoriesByCompany?: Maybe<Array<Maybe<Category>>>;
  category?: Maybe<Category>;
  categoryTree?: Maybe<Array<Maybe<Category>>>;
  collection?: Maybe<Collection>;
  collectionAverageRating?: Maybe<Scalars['Float']['output']>;
  collectionQuestions?: Maybe<Array<Maybe<Question>>>;
  collectionReviews?: Maybe<Array<Maybe<Review>>>;
  collections?: Maybe<Array<Maybe<Collection>>>;
  collectionsByCategory?: Maybe<Array<Maybe<Collection>>>;
  collectionsByCompany?: Maybe<Array<Maybe<Collection>>>;
  company?: Maybe<Company>;
  companyMessages?: Maybe<Array<Maybe<Message>>>;
  dashboardStats?: Maybe<DashboardStats>;
  featuredCollections?: Maybe<Array<Maybe<Collection>>>;
  manufacturerOrders?: Maybe<Array<Maybe<Order>>>;
  me?: Maybe<User>;
  myCategories?: Maybe<Array<Maybe<Category>>>;
  myCertifications?: Maybe<Array<Maybe<Certification>>>;
  myCollections?: Maybe<Array<Maybe<Collection>>>;
  myColors?: Maybe<Array<Maybe<Color>>>;
  myCompanyEmployees: Array<User>;
  myFabrics?: Maybe<Array<Maybe<Fabric>>>;
  myFits?: Maybe<Array<Maybe<FitItem>>>;
  myMessages?: Maybe<Array<Maybe<Message>>>;
  myNotifications: Array<Notification>;
  myOrders?: Maybe<Array<Maybe<Order>>>;
  myQuestions?: Maybe<Array<Maybe<Question>>>;
  myReviews?: Maybe<Array<Maybe<Review>>>;
  mySamples?: Maybe<Array<Maybe<Sample>>>;
  mySeasons?: Maybe<Array<Maybe<SeasonItem>>>;
  mySizeGroups?: Maybe<Array<Maybe<SizeGroup>>>;
  myWorkshops?: Maybe<Array<Maybe<Workshop>>>;
  notification?: Maybe<Notification>;
  order?: Maybe<Order>;
  orders?: Maybe<Array<Maybe<Order>>>;
  pendingReviews?: Maybe<Array<Maybe<Review>>>;
  productionAnalytics?: Maybe<ProductionAnalytics>;
  productionTracking?: Maybe<ProductionTracking>;
  publicPlatformStats?: Maybe<PublicPlatformStats>;
  rootCategories?: Maybe<Array<Maybe<Category>>>;
  sample?: Maybe<Sample>;
  sampleProductionHistory?: Maybe<Array<Maybe<SampleProduction>>>;
  samples?: Maybe<Array<Maybe<Sample>>>;
  unansweredQuestions?: Maybe<Array<Maybe<Question>>>;
  unreadMessageCount?: Maybe<Scalars['Int']['output']>;
  unreadNotificationCount: Scalars['Int']['output'];
  userStats?: Maybe<UserStats>;
  workshop?: Maybe<Workshop>;
  workshopStats?: Maybe<WorkshopStats>;
  workshops?: Maybe<Array<Maybe<Workshop>>>;
};


export type QueryAllUsersArgs = {
  role?: InputMaybe<Role>;
  searchString?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAssignedOrdersArgs = {
  status?: InputMaybe<OrderStatus>;
};


export type QueryAssignedSamplesArgs = {
  sampleType?: InputMaybe<SampleType>;
  status?: InputMaybe<SampleStatus>;
};


export type QueryCategoriesByCompanyArgs = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCategoryArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCollectionArgs = {
  id: Scalars['Int']['input'];
};


export type QueryCollectionAverageRatingArgs = {
  collectionId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCollectionQuestionsArgs = {
  collectionId?: InputMaybe<Scalars['Int']['input']>;
  includePrivate?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryCollectionReviewsArgs = {
  approvedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  collectionId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCollectionsArgs = {
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  manufacturerName?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCollectionsByCategoryArgs = {
  categoryId: Scalars['Int']['input'];
  includeSubcategories?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryCollectionsByCompanyArgs = {
  companyId: Scalars['Int']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryCompanyArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCompanyMessagesArgs = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDashboardStatsArgs = {
  period?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFeaturedCollectionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryManufacturerOrdersArgs = {
  status?: InputMaybe<OrderStatus>;
};


export type QueryMyMessagesArgs = {
  filter?: InputMaybe<MessageFilterInput>;
};


export type QueryMyNotificationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryMyOrdersArgs = {
  status?: InputMaybe<OrderStatus>;
};


export type QueryMySamplesArgs = {
  sampleType?: InputMaybe<SampleType>;
  status?: InputMaybe<SampleStatus>;
};


export type QueryNotificationArgs = {
  id: Scalars['Int']['input'];
};


export type QueryOrderArgs = {
  id: Scalars['Int']['input'];
};


export type QueryOrdersArgs = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  customerId?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  manufactureId?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<OrderStatus>;
};


export type QueryProductionTrackingArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
  orderId?: InputMaybe<Scalars['Int']['input']>;
  sampleId?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySampleArgs = {
  id: Scalars['Int']['input'];
};


export type QuerySampleProductionHistoryArgs = {
  sampleId: Scalars['Int']['input'];
};


export type QuerySamplesArgs = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  customerId?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  manufactureId?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sampleType?: InputMaybe<SampleType>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<SampleStatus>;
};


export type QueryWorkshopArgs = {
  id: Scalars['Int']['input'];
};


export type QueryWorkshopStatsArgs = {
  workshopId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryWorkshopsArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<WorkshopType>;
};

export type Question = {
  __typename?: 'Question';
  answer?: Maybe<Scalars['String']['output']>;
  collection?: Maybe<Collection>;
  collectionId: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  customer?: Maybe<User>;
  customerId: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  isAnswered: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  manufacture?: Maybe<User>;
  manufactureId: Scalars['Int']['output'];
  question: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type RecentActivity = {
  __typename?: 'RecentActivity';
  activeProductionsNow: Scalars['Int']['output'];
  completedOrdersThisMonth: Scalars['Int']['output'];
  latestCollections?: Maybe<Array<Maybe<LatestCollection>>>;
  newCollectionsThisWeek: Scalars['Int']['output'];
  newManufacturersThisMonth: Scalars['Int']['output'];
};

export type Review = {
  __typename?: 'Review';
  collection?: Maybe<Collection>;
  collectionId: Scalars['Int']['output'];
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  customer?: Maybe<User>;
  customerId: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  isApproved: Scalars['Boolean']['output'];
  rating: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
};

/** User roles in the system */
export enum Role {
  Admin = 'ADMIN',
  CompanyEmployee = 'COMPANY_EMPLOYEE',
  CompanyOwner = 'COMPANY_OWNER',
  Customer = 'CUSTOMER',
  IndividualCustomer = 'INDIVIDUAL_CUSTOMER',
  Manufacture = 'MANUFACTURE'
}

export type Sample = {
  __typename?: 'Sample';
  actualProductionDate?: Maybe<Scalars['DateTime']['output']>;
  aiAnalysis?: Maybe<AiAnalysis>;
  aiGenerated?: Maybe<Scalars['Boolean']['output']>;
  aiPrompt?: Maybe<Scalars['String']['output']>;
  aiSketchUrl?: Maybe<Scalars['String']['output']>;
  cargoTrackingNumber?: Maybe<Scalars['String']['output']>;
  collection?: Maybe<Collection>;
  company?: Maybe<Company>;
  createdAt: Scalars['DateTime']['output'];
  customDesignImages?: Maybe<Scalars['String']['output']>;
  customer?: Maybe<User>;
  customerNote?: Maybe<Scalars['String']['output']>;
  deliveryAddress?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  estimatedProductionDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Int']['output'];
  images?: Maybe<Scalars['String']['output']>;
  manufacture?: Maybe<User>;
  manufacturerResponse?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  originalCollection?: Maybe<Collection>;
  originalCollectionId?: Maybe<Scalars['Int']['output']>;
  productionDays?: Maybe<Scalars['Int']['output']>;
  productionHistory?: Maybe<Array<Maybe<SampleProduction>>>;
  productionTracking?: Maybe<Array<Maybe<ProductionTracking>>>;
  revisionRequests?: Maybe<Scalars['String']['output']>;
  sampleNumber: Scalars['String']['output'];
  sampleType: SampleType;
  shippingDate?: Maybe<Scalars['DateTime']['output']>;
  status: SampleStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type SampleProduction = {
  __typename?: 'SampleProduction';
  actualDate?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  estimatedDays?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  note?: Maybe<Scalars['String']['output']>;
  sample?: Maybe<Sample>;
  status: SampleStatus;
  updatedBy?: Maybe<User>;
};

/** Status workflow for sample production - 13 stages (including AI design, hold and cancel options) */
export enum SampleStatus {
  AiDesign = 'AI_DESIGN',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  InDesign = 'IN_DESIGN',
  InProduction = 'IN_PRODUCTION',
  OnHold = 'ON_HOLD',
  PatternReady = 'PATTERN_READY',
  PendingApproval = 'PENDING_APPROVAL',
  QualityCheck = 'QUALITY_CHECK',
  Received = 'RECEIVED',
  Rejected = 'REJECTED',
  Requested = 'REQUESTED',
  Shipped = 'SHIPPED'
}

/** Types of samples that can be requested */
export enum SampleType {
  Custom = 'CUSTOM',
  Development = 'DEVELOPMENT',
  Revision = 'REVISION',
  Standard = 'STANDARD'
}

/** Fashion seasons (Spring/Summer, Fall/Winter) */
export enum Season {
  Fw25 = 'FW25',
  Fw26 = 'FW26',
  Fw27 = 'FW27',
  Ss25 = 'SS25',
  Ss26 = 'SS26',
  Ss27 = 'SS27'
}

export type SeasonItem = {
  __typename?: 'SeasonItem';
  company?: Maybe<Company>;
  companyId: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  fullName: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  startDate?: Maybe<Scalars['DateTime']['output']>;
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  year: Scalars['Int']['output'];
};

export type SignupInput = {
  companyFlow?: InputMaybe<CompanyFlowInput>;
  companyId?: InputMaybe<Scalars['String']['input']>;
  department?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  jobTitle?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  permissions?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Role>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type SizeGroup = {
  __typename?: 'SizeGroup';
  category?: Maybe<Scalars['String']['output']>;
  company?: Maybe<Company>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  sizes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  updatedAt: Scalars['DateTime']['output'];
};

/** Sort order for queries */
export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export type StageBreakdown = {
  __typename?: 'StageBreakdown';
  count: Scalars['Int']['output'];
  stage: Scalars['String']['output'];
};

/** Status of individual production stage */
export enum StageStatus {
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  NotStarted = 'NOT_STARTED',
  OnHold = 'ON_HOLD',
  RequiresRevision = 'REQUIRES_REVISION'
}

export type SuggestedModel = {
  __typename?: 'SuggestedModel';
  prompt: Scalars['String']['output'];
  variant: Scalars['String']['output'];
};

export type SupplierInfo = {
  __typename?: 'SupplierInfo';
  city?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type SustainabilityMetrics = {
  __typename?: 'SustainabilityMetrics';
  carbonFootprintReduction: Scalars['Float']['output'];
  certifiedOrganicProducts: Scalars['Int']['output'];
  gotsChronumCertified: Scalars['Int']['output'];
  recycledMaterialUsage: Scalars['Float']['output'];
  waterSavedLiters: Scalars['Int']['output'];
};

export type Testimonial = {
  __typename?: 'Testimonial';
  comment: Scalars['String']['output'];
  name: Scalars['String']['output'];
  rating: Scalars['Int']['output'];
  role: Scalars['String']['output'];
};

export type UpdateCategoryInput = {
  companyId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  parentCategoryId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateCollectionInput = {
  accessories?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  colors?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  fabricComposition?: InputMaybe<Scalars['String']['input']>;
  fit?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Gender>;
  id: Scalars['Int']['input'];
  images?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  measurementChart?: InputMaybe<Scalars['String']['input']>;
  modelCode?: InputMaybe<Scalars['String']['input']>;
  moq?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  productionSchedule?: InputMaybe<Scalars['String']['input']>;
  season?: InputMaybe<Season>;
  sizeGroupIds?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  sizeRange?: InputMaybe<Scalars['String']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  stock?: InputMaybe<Scalars['Int']['input']>;
  targetLeadTime?: InputMaybe<Scalars['Int']['input']>;
  targetPrice?: InputMaybe<Scalars['Float']['input']>;
  techPack?: InputMaybe<Scalars['String']['input']>;
  trend?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateColorInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  hexCode?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCompanyInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateFabricInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  composition?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  leadTime?: InputMaybe<Scalars['Int']['input']>;
  minOrder?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  supplier?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Int']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateOrderInput = {
  actualDelivery?: InputMaybe<Scalars['DateTime']['input']>;
  estimatedDelivery?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['Int']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  specifications?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<OrderStatus>;
  unitPrice?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateProductionStageInput = {
  estimatedDays?: InputMaybe<Scalars['Int']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  productionId: Scalars['Int']['input'];
  stage: ProductionStage;
  status: StageStatus;
};

export type UpdateSampleInput = {
  actualProductionDate?: InputMaybe<Scalars['DateTime']['input']>;
  cargoTrackingNumber?: InputMaybe<Scalars['String']['input']>;
  customerNote?: InputMaybe<Scalars['String']['input']>;
  deliveryAddress?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedProductionDate?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['Int']['input'];
  manufacturerResponse?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  productionDays?: InputMaybe<Scalars['Int']['input']>;
  shippingDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<SampleStatus>;
};

export type UpdateSampleStatusInput = {
  estimatedDays?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['Int']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  status: SampleStatus;
};

export type UpdateSizeGroupInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sizes?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateWorkshopInput = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['Int']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<WorkshopType>;
};

export type User = {
  __typename?: 'User';
  company?: Maybe<Company>;
  companyId?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['String']['output'];
  department?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  isCompanyOwner: Scalars['Boolean']['output'];
  isPendingApproval: Scalars['Boolean']['output'];
  jobTitle?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  role: Role;
  updatedAt: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type UserStats = {
  __typename?: 'UserStats';
  adminCount: Scalars['Int']['output'];
  customerCount: Scalars['Int']['output'];
  manufactureCount: Scalars['Int']['output'];
  totalUsers: Scalars['Int']['output'];
};

export type UserUpdateInput = {
  companyId?: InputMaybe<Scalars['String']['input']>;
  department?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isCompanyOwner?: InputMaybe<Scalars['Boolean']['input']>;
  jobTitle?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  permissions?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Role>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type Workshop = {
  __typename?: 'Workshop';
  activeProductionCount?: Maybe<Scalars['Int']['output']>;
  capacity?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  location?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner?: Maybe<User>;
  ownerId: Scalars['Int']['output'];
  packagingProductions?: Maybe<Array<Maybe<ProductionTracking>>>;
  sewingProductions?: Maybe<Array<Maybe<ProductionTracking>>>;
  totalProductionCount?: Maybe<Scalars['Int']['output']>;
  type: WorkshopType;
  updatedAt: Scalars['DateTime']['output'];
  utilizationRate?: Maybe<Scalars['Float']['output']>;
};

export type WorkshopStats = {
  __typename?: 'WorkshopStats';
  activeProductions: Scalars['Int']['output'];
  completedProductions: Scalars['Int']['output'];
  totalProductions: Scalars['Int']['output'];
  totalWorkshops: Scalars['Int']['output'];
  utilizationRate: Scalars['Int']['output'];
};

/** Types of workshops */
export enum WorkshopType {
  General = 'GENERAL',
  Packaging = 'PACKAGING',
  QualityControl = 'QUALITY_CONTROL',
  Sewing = 'SEWING'
}

export type MyCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyCategoriesQuery = { __typename?: 'Query', myCategories?: Array<{ __typename?: 'Category', id: number, name: string, description?: string | null, createdAt: string, parentCategory?: { __typename?: 'Category', id: number, name: string } | null, company?: { __typename?: 'Company', id: number, name: string } | null, author?: { __typename?: 'User', id: number, firstName?: string | null, lastName?: string | null } | null, subCategories?: Array<{ __typename?: 'Category', id: number, name: string, description?: string | null } | null> | null } | null> | null };

export type CreateCategoryInPageMutationVariables = Exact<{
  name: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  parentCategoryId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CreateCategoryInPageMutation = { __typename?: 'Mutation', createCategory?: { __typename?: 'Category', id: number, name: string, description?: string | null } | null };

export type UpdateCategoryInPageMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  parentCategoryId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateCategoryInPageMutation = { __typename?: 'Mutation', updateCategory?: { __typename?: 'Category', id: number, name: string, description?: string | null } | null };

export type DeleteCategoryInPageMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteCategoryInPageMutation = { __typename?: 'Mutation', deleteCategory?: { __typename?: 'Category', id: number } | null };

export type CompanyDetailsQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type CompanyDetailsQuery = { __typename?: 'Query', company?: { __typename?: 'Company', id: number, name: string, email: string, phone?: string | null, address?: string | null, website?: string | null, type: CompanyType, description?: string | null, isActive: boolean, createdAt: string } | null };

export type UpdateCompanySettingsMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateCompanySettingsMutation = { __typename?: 'Mutation', updateCompany?: { __typename?: 'Company', id: number, name: string, email: string } | null };

export type MyCompanyEmployeesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyCompanyEmployeesQuery = { __typename?: 'Query', myCompanyEmployees: Array<{ __typename?: 'User', id: number, email: string, firstName?: string | null, lastName?: string | null, phone?: string | null, role: Role, department?: string | null, jobTitle?: string | null, isCompanyOwner: boolean, isActive: boolean, createdAt: string, company?: { __typename?: 'Company', id: number, name: string } | null }> };

export type CreateEmployeeMutationVariables = Exact<{
  input: SignupInput;
}>;


export type CreateEmployeeMutation = { __typename?: 'Mutation', signup?: { __typename?: 'AuthPayload', user: { __typename?: 'User', id: number, email: string, firstName?: string | null, lastName?: string | null } } | null };

export type UpdateEmployeeMutationVariables = Exact<{
  input: UserUpdateInput;
}>;


export type UpdateEmployeeMutation = { __typename?: 'Mutation', updateUser?: { __typename?: 'User', id: number, email: string, firstName?: string | null, lastName?: string | null } | null };

export type DeleteEmployeeMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteEmployeeMutation = { __typename?: 'Mutation', deleteUser?: { __typename?: 'User', id: number } | null };

export type MyCertificationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyCertificationsQuery = { __typename?: 'Query', myCertifications?: Array<{ __typename?: 'Certification', id: number, name: string, code?: string | null, category: CertificationCategory, issuer?: string | null, validFrom?: any | null, validUntil?: any | null, certificateNumber?: string | null, certificateFile?: string | null, description?: string | null, isActive: boolean } | null> | null };

export type CreateCertificationMutationVariables = Exact<{
  name: Scalars['String']['input'];
  code?: InputMaybe<Scalars['String']['input']>;
  category: CertificationCategory;
  issuer?: InputMaybe<Scalars['String']['input']>;
  validFrom?: InputMaybe<Scalars['DateTime']['input']>;
  validUntil?: InputMaybe<Scalars['DateTime']['input']>;
  certificateNumber?: InputMaybe<Scalars['String']['input']>;
  certificateFile?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateCertificationMutation = { __typename?: 'Mutation', createCertification?: { __typename?: 'Certification', id: number, name: string } | null };

export type UpdateCertificationMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<CertificationCategory>;
  issuer?: InputMaybe<Scalars['String']['input']>;
  validFrom?: InputMaybe<Scalars['DateTime']['input']>;
  validUntil?: InputMaybe<Scalars['DateTime']['input']>;
  certificateNumber?: InputMaybe<Scalars['String']['input']>;
  certificateFile?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type UpdateCertificationMutation = { __typename?: 'Mutation', updateCertification?: { __typename?: 'Certification', id: number, name: string } | null };

export type DeleteCertificationMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteCertificationMutation = { __typename?: 'Mutation', deleteCertification?: { __typename?: 'Certification', id: number } | null };

export type PendingStageApprovalsQueryVariables = Exact<{ [key: string]: never; }>;


export type PendingStageApprovalsQuery = { __typename?: 'Query', allProductionTracking?: Array<{ __typename?: 'ProductionTracking', id: number, currentStage: ProductionStage, overallStatus: ProductionStatus, estimatedEndDate?: string | null, order?: { __typename?: 'Order', id: number, orderNumber: string } | null, sample?: { __typename?: 'Sample', id: number, sampleNumber: string } | null, stageUpdates?: Array<{ __typename?: 'ProductionStageUpdate', id: number, stage: ProductionStage, status: StageStatus, estimatedDays?: number | null, actualStartDate?: string | null } | null> | null } | null> | null };

export type GenerateSampleDesignMutationVariables = Exact<{
  sketchUrl: Scalars['String']['input'];
  prompt: Scalars['String']['input'];
  negativePrompt?: InputMaybe<Scalars['String']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  steps?: InputMaybe<Scalars['Int']['input']>;
  cfgScale?: InputMaybe<Scalars['Float']['input']>;
  collectionId?: InputMaybe<Scalars['Int']['input']>;
  sampleName?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type GenerateSampleDesignMutation = { __typename?: 'Mutation', generateSampleDesign?: { __typename?: 'Sample', id: number, sampleNumber: string, name?: string | null, description?: string | null, status: SampleStatus, images?: string | null, aiGenerated?: boolean | null, aiPrompt?: string | null, aiSketchUrl?: string | null, createdAt: any } | null };

export type DashboardStatsQueryVariables = Exact<{
  period?: InputMaybe<Scalars['String']['input']>;
}>;


export type DashboardStatsQuery = { __typename?: 'Query', dashboardStats?: { __typename?: 'DashboardStats', totalCollections: number, totalSamples: number, totalOrders: number, totalProductions: number, pendingSamples: number, activeSamples: number, completedSamples: number, pendingOrders: number, activeOrders: number, completedOrders: number, activeProductions: number, completedProductions: number, totalMessages: number, unreadMessages: number, passedQC: number, failedQC: number, qcPassRate: number, recentSamples?: Array<{ __typename?: 'Sample', id: number, sampleNumber: string, status: SampleStatus, createdAt: any, collection?: { __typename?: 'Collection', id: number, name: string } | null } | null> | null, recentOrders?: Array<{ __typename?: 'Order', id: number, orderNumber: string, status: OrderStatus, quantity: number, totalPrice: number, createdAt: any } | null> | null, recentProductions?: Array<{ __typename?: 'ProductionTracking', id: number, currentStage: ProductionStage, createdAt: string, order?: { __typename?: 'Order', id: number, orderNumber: string } | null } | null> | null, monthlyStats?: Array<{ __typename?: 'MonthlyStats', month: string, samples: number, orders: number, completedProductions: number, revenue: number } | null> | null } | null };

export type ProductionAnalyticsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductionAnalyticsQuery = { __typename?: 'Query', productionAnalytics?: { __typename?: 'ProductionAnalytics', totalInProgress: number, totalCompleted: number, avgProductionDays: number, stageBreakdown: Array<{ __typename?: 'StageBreakdown', stage: string, count: number } | null> } | null };

export type UserStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type UserStatsQuery = { __typename?: 'Query', userStats?: { __typename?: 'UserStats', totalUsers: number, adminCount: number, manufactureCount: number, customerCount: number } | null };

export type MyStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyStatsQuery = { __typename?: 'Query', mySamples?: Array<{ __typename?: 'Sample', id: number, status: SampleStatus, createdAt: any } | null> | null, myOrders?: Array<{ __typename?: 'Order', id: number, status: OrderStatus, totalPrice: number, createdAt: any } | null> | null };

export type MyColorsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyColorsQuery = { __typename?: 'Query', myColors?: Array<{ __typename?: 'Color', id: number, name: string, code?: string | null, hexCode?: string | null, imageUrl?: string | null, isActive: boolean, createdAt: any } | null> | null };

export type CreateColorMutationVariables = Exact<{
  input: CreateColorInput;
}>;


export type CreateColorMutation = { __typename?: 'Mutation', createColor?: { __typename?: 'Color', id: number, name: string, code?: string | null, hexCode?: string | null } | null };

export type UpdateColorMutationVariables = Exact<{
  input: UpdateColorInput;
}>;


export type UpdateColorMutation = { __typename?: 'Mutation', updateColor?: { __typename?: 'Color', id: number, name: string, code?: string | null, hexCode?: string | null } | null };

export type DeleteColorMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteColorMutation = { __typename?: 'Mutation', deleteColor?: { __typename?: 'Color', id: number } | null };

export type MyFabricsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyFabricsQuery = { __typename?: 'Query', myFabrics?: Array<{ __typename?: 'Fabric', id: number, name: string, code?: string | null, composition: string, weight?: number | null, width?: number | null, supplier?: string | null, price?: number | null, minOrder?: number | null, leadTime?: number | null, imageUrl?: string | null, description?: string | null, isActive: boolean, createdAt: any } | null> | null };

export type CreateFabricMutationVariables = Exact<{
  input: CreateFabricInput;
}>;


export type CreateFabricMutation = { __typename?: 'Mutation', createFabric?: { __typename?: 'Fabric', id: number, name: string, code?: string | null, composition: string } | null };

export type UpdateFabricMutationVariables = Exact<{
  input: UpdateFabricInput;
}>;


export type UpdateFabricMutation = { __typename?: 'Mutation', updateFabric?: { __typename?: 'Fabric', id: number, name: string, code?: string | null, composition: string } | null };

export type DeleteFabricMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteFabricMutation = { __typename?: 'Mutation', deleteFabric?: { __typename?: 'Fabric', id: number } | null };

export type MySizeGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type MySizeGroupsQuery = { __typename?: 'Query', mySizeGroups?: Array<{ __typename?: 'SizeGroup', id: number, name: string, category?: string | null, sizes?: Array<string | null> | null, description?: string | null, isActive: boolean, createdAt: any } | null> | null };

export type CreateSizeGroupMutationVariables = Exact<{
  input: CreateSizeGroupInput;
}>;


export type CreateSizeGroupMutation = { __typename?: 'Mutation', createSizeGroup?: { __typename?: 'SizeGroup', id: number, name: string, sizes?: Array<string | null> | null } | null };

export type UpdateSizeGroupMutationVariables = Exact<{
  input: UpdateSizeGroupInput;
}>;


export type UpdateSizeGroupMutation = { __typename?: 'Mutation', updateSizeGroup?: { __typename?: 'SizeGroup', id: number, name: string, sizes?: Array<string | null> | null } | null };

export type DeleteSizeGroupMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteSizeGroupMutation = { __typename?: 'Mutation', deleteSizeGroup?: { __typename?: 'SizeGroup', id: number } | null };

export type MySeasonsQueryVariables = Exact<{ [key: string]: never; }>;


export type MySeasonsQuery = { __typename?: 'Query', mySeasons?: Array<{ __typename?: 'SeasonItem', id: number, name: string, fullName: string, year: number, type: string, startDate?: any | null, endDate?: any | null, description?: string | null, isActive: boolean, companyId: number, createdAt: any, updatedAt: any } | null> | null };

export type CreateSeasonMutationVariables = Exact<{
  name: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  year: Scalars['Int']['input'];
  type: Scalars['String']['input'];
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateSeasonMutation = { __typename?: 'Mutation', createSeason?: { __typename?: 'SeasonItem', id: number, name: string, fullName: string } | null };

export type UpdateSeasonMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type UpdateSeasonMutation = { __typename?: 'Mutation', updateSeason?: { __typename?: 'SeasonItem', id: number, name: string, fullName: string } | null };

export type DeleteSeasonMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteSeasonMutation = { __typename?: 'Mutation', deleteSeason?: { __typename?: 'SeasonItem', id: number } | null };

export type MyFitsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyFitsQuery = { __typename?: 'Query', myFits?: Array<{ __typename?: 'FitItem', id: number, name: string, code?: string | null, category?: string | null, description?: string | null, isActive: boolean, companyId: number, createdAt: any, updatedAt: any } | null> | null };

export type CreateFitMutationVariables = Exact<{
  name: Scalars['String']['input'];
  code?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateFitMutation = { __typename?: 'Mutation', createFit?: { __typename?: 'FitItem', id: number, name: string, code?: string | null } | null };

export type UpdateFitMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type UpdateFitMutation = { __typename?: 'Mutation', updateFit?: { __typename?: 'FitItem', id: number, name: string, code?: string | null } | null };

export type DeleteFitMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteFitMutation = { __typename?: 'Mutation', deleteFit?: { __typename?: 'FitItem', id: number } | null };

export type SendMessageMutationVariables = Exact<{
  input: CreateMessageInput;
}>;


export type SendMessageMutation = { __typename?: 'Mutation', sendMessage?: { __typename?: 'Message', id: number, content: string, senderId: number, receiver?: string | null, isRead: boolean, type: string, createdAt: string, sender?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string } | null, company?: { __typename?: 'Company', id: number, name: string } | null } | null };

export type MarkMessageAsReadMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type MarkMessageAsReadMutation = { __typename?: 'Mutation', markMessageAsRead?: { __typename?: 'Message', id: number, isRead: boolean } | null };

export type DeleteMessageMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteMessageMutation = { __typename?: 'Mutation', deleteMessage?: { __typename?: 'Message', id: number } | null };

export type MyMessagesQueryVariables = Exact<{
  filter?: InputMaybe<MessageFilterInput>;
}>;


export type MyMessagesQuery = { __typename?: 'Query', myMessages?: Array<{ __typename?: 'Message', id: number, content: string, senderId: number, receiver?: string | null, isRead: boolean, type: string, createdAt: string, sender?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string, company?: { __typename?: 'Company', id: number, name: string } | null } | null, company?: { __typename?: 'Company', id: number, name: string } | null } | null> | null };

export type UnreadMessageCountQueryVariables = Exact<{ [key: string]: never; }>;


export type UnreadMessageCountQuery = { __typename?: 'Query', unreadMessageCount?: number | null };

export type CompanyMessagesQueryVariables = Exact<{
  companyId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CompanyMessagesQuery = { __typename?: 'Query', companyMessages?: Array<{ __typename?: 'Message', id: number, content: string, senderId: number, receiver?: string | null, isRead: boolean, type: string, createdAt: string, sender?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string } | null, company?: { __typename?: 'Company', id: number, name: string } | null } | null> | null };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login?: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: number, email: string, name?: string | null, firstName?: string | null, lastName?: string | null, role: Role, companyId?: number | null, isActive: boolean, createdAt: string, updatedAt: string } } | null };

export type SignupMutationVariables = Exact<{
  input: SignupInput;
}>;


export type SignupMutation = { __typename?: 'Mutation', signup?: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: number, email: string, name?: string | null, firstName?: string | null, lastName?: string | null, role: Role, companyId?: number | null, isCompanyOwner: boolean, isPendingApproval: boolean, department?: string | null, jobTitle?: string | null, isActive: boolean, createdAt: string, updatedAt: string, company?: { __typename?: 'Company', id: number, name: string, type: CompanyType } | null } } | null };

export type CreateUserMutationVariables = Exact<{
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role: Role;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser?: { __typename?: 'User', id: number, email: string, name?: string | null, role: Role, isActive: boolean, createdAt: string, updatedAt: string } | null };

export type UpdateUserMutationVariables = Exact<{
  input: UserUpdateInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser?: { __typename?: 'User', id: number, email: string, name?: string | null, firstName?: string | null, lastName?: string | null, role: Role, isActive: boolean, createdAt: string, updatedAt: string } | null };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser?: { __typename?: 'User', id: number, email: string, name?: string | null } | null };

export type CreateCompanyMutationVariables = Exact<{
  name: Scalars['String']['input'];
  email: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CreateCompanyMutation = { __typename?: 'Mutation', createCompany?: { __typename?: 'Company', id: number, name: string, email: string, phone?: string | null, address?: string | null, website?: string | null, isActive: boolean, createdAt: string, updatedAt: string } | null };

export type UpdateCompanyMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type UpdateCompanyMutation = { __typename?: 'Mutation', updateCompany?: { __typename?: 'Company', id: number, name: string, email: string, phone?: string | null, address?: string | null, website?: string | null, isActive: boolean, createdAt: string, updatedAt: string } | null };

export type DeleteCompanyMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteCompanyMutation = { __typename?: 'Mutation', deleteCompany?: { __typename?: 'Company', id: number, name: string, email: string } | null };

export type CreateCategoryMutationVariables = Exact<{
  name: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  parentCategoryId?: InputMaybe<Scalars['Int']['input']>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CreateCategoryMutation = { __typename?: 'Mutation', createCategory?: { __typename?: 'Category', id: number, name: string, description?: string | null, collectionsCount?: number | null, createdAt: string, updatedAt: string, author?: { __typename?: 'User', id: number, name?: string | null } | null, company?: { __typename?: 'Company', id: number, name: string } | null, parentCategory?: { __typename?: 'Category', id: number, name: string } | null } | null };

export type UpdateCategoryMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  parentCategoryId?: InputMaybe<Scalars['Int']['input']>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateCategoryMutation = { __typename?: 'Mutation', updateCategory?: { __typename?: 'Category', id: number, name: string, description?: string | null, collectionsCount?: number | null, createdAt: string, updatedAt: string, author?: { __typename?: 'User', id: number, name?: string | null } | null, company?: { __typename?: 'Company', id: number, name: string } | null, parentCategory?: { __typename?: 'Category', id: number, name: string } | null } | null };

export type DeleteCategoryMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteCategoryMutation = { __typename?: 'Mutation', deleteCategory?: { __typename?: 'Category', id: number, name: string } | null };

export type CreateCollectionMutationVariables = Exact<{
  input: CreateCollectionInput;
}>;


export type CreateCollectionMutation = { __typename?: 'Mutation', createCollection?: { __typename?: 'Collection', id: number, name: string, description?: string | null, price: number, sku?: string | null, stock: number, images?: Array<string | null> | null, isActive: boolean, isFeatured: boolean, slug?: string | null, createdAt: any, updatedAt: any, category?: { __typename?: 'Category', id: number, name: string } | null, company?: { __typename?: 'Company', id: number, name: string } | null, author?: { __typename?: 'User', id: number, name?: string | null } | null } | null };

export type UpdateCollectionMutationVariables = Exact<{
  input: UpdateCollectionInput;
}>;


export type UpdateCollectionMutation = { __typename?: 'Mutation', updateCollection?: { __typename?: 'Collection', id: number, name: string, description?: string | null, price: number, sku?: string | null, stock: number, images?: Array<string | null> | null, isActive: boolean, isFeatured: boolean, slug?: string | null, createdAt: any, updatedAt: any, category?: { __typename?: 'Category', id: number, name: string } | null, company?: { __typename?: 'Company', id: number, name: string } | null, author?: { __typename?: 'User', id: number, name?: string | null } | null } | null };

export type DeleteCollectionMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteCollectionMutation = { __typename?: 'Mutation', deleteCollection?: { __typename?: 'Collection', id: number, name: string } | null };

export type CreateSampleMutationVariables = Exact<{
  input: CreateSampleInput;
}>;


export type CreateSampleMutation = { __typename?: 'Mutation', createSample?: { __typename?: 'Sample', id: number, sampleNumber: string, sampleType: SampleType, status: SampleStatus, customerNote?: string | null, createdAt: any, collection?: { __typename?: 'Collection', id: number, name: string } | null, manufacture?: { __typename?: 'User', id: number, name?: string | null } | null, aiAnalysis?: { __typename?: 'AIAnalysis', id: number, detectedProduct?: string | null, detectedColor?: string | null, detectedFabric?: string | null, qualityScore?: number | null, estimatedCostMin?: number | null, estimatedCostMax?: number | null, trendScore?: number | null, designStyle?: string | null } | null } | null };

export type UpdateSampleMutationVariables = Exact<{
  input: UpdateSampleInput;
}>;


export type UpdateSampleMutation = { __typename?: 'Mutation', updateSample?: { __typename?: 'Sample', id: number, sampleNumber: string, status: SampleStatus, customerNote?: string | null, manufacturerResponse?: string | null, productionDays?: number | null, estimatedProductionDate?: any | null, actualProductionDate?: any | null, shippingDate?: any | null, cargoTrackingNumber?: string | null, updatedAt: any } | null };

export type UpdateSampleStatusMutationVariables = Exact<{
  input: UpdateSampleStatusInput;
}>;


export type UpdateSampleStatusMutation = { __typename?: 'Mutation', updateSampleStatus?: { __typename?: 'Sample', id: number, sampleNumber: string, status: SampleStatus, productionDays?: number | null, estimatedProductionDate?: any | null, actualProductionDate?: any | null, updatedAt: any } | null };

export type DeleteSampleMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteSampleMutation = { __typename?: 'Mutation', deleteSample?: { __typename?: 'Sample', id: number, sampleNumber: string } | null };

export type ApproveSampleMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  approve: Scalars['Boolean']['input'];
  manufacturerNote?: InputMaybe<Scalars['String']['input']>;
  estimatedDays?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ApproveSampleMutation = { __typename?: 'Mutation', approveSample?: { __typename?: 'Sample', id: number, sampleNumber: string, status: SampleStatus, manufacturerResponse?: string | null, productionDays?: number | null, estimatedProductionDate?: any | null, updatedAt: any } | null };

export type HoldSampleMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type HoldSampleMutation = { __typename?: 'Mutation', holdSample?: { __typename?: 'Sample', id: number, sampleNumber: string, status: SampleStatus, manufacturerResponse?: string | null, updatedAt: any } | null };

export type CancelSampleMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type CancelSampleMutation = { __typename?: 'Mutation', cancelSample?: { __typename?: 'Sample', id: number, sampleNumber: string, status: SampleStatus, manufacturerResponse?: string | null, updatedAt: any } | null };

export type ResumeSampleMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
}>;


export type ResumeSampleMutation = { __typename?: 'Mutation', resumeSample?: { __typename?: 'Sample', id: number, sampleNumber: string, status: SampleStatus, updatedAt: any } | null };

export type CreateOrderMutationVariables = Exact<{
  collectionId: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
  unitPrice?: InputMaybe<Scalars['Float']['input']>;
  customerNote?: InputMaybe<Scalars['String']['input']>;
  deliveryAddress?: InputMaybe<Scalars['String']['input']>;
  estimatedDelivery?: InputMaybe<Scalars['DateTime']['input']>;
  manufactureId?: InputMaybe<Scalars['Int']['input']>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CreateOrderMutation = { __typename?: 'Mutation', createOrder?: { __typename?: 'Order', id: number, orderNumber: string, status: OrderStatus, quantity: number, unitPrice: number, totalPrice: number, createdAt: any, collection?: { __typename?: 'Collection', id: number, name: string } | null, manufacture?: { __typename?: 'User', id: number, name?: string | null } | null } | null };

export type UpdateOrderStatusMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  status: OrderStatus;
  note?: InputMaybe<Scalars['String']['input']>;
  estimatedDays?: InputMaybe<Scalars['Int']['input']>;
  quotedPrice?: InputMaybe<Scalars['Float']['input']>;
}>;


export type UpdateOrderStatusMutation = { __typename?: 'Mutation', updateOrderStatus?: { __typename?: 'Order', id: number, orderNumber: string, status: OrderStatus, unitPrice: number, totalPrice: number, productionDays?: number | null, estimatedProductionDate?: any | null, updatedAt: any } | null };

export type UpdateOrderMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  status?: InputMaybe<OrderStatus>;
  manufacturerResponse?: InputMaybe<Scalars['String']['input']>;
  productionDays?: InputMaybe<Scalars['Int']['input']>;
  estimatedProductionDate?: InputMaybe<Scalars['DateTime']['input']>;
}>;


export type UpdateOrderMutation = { __typename?: 'Mutation', updateOrder?: { __typename?: 'Order', id: number, status: OrderStatus, manufacturerResponse?: string | null, productionDays?: number | null, estimatedProductionDate?: any | null } | null };

export type UpdateCustomerOrderMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  quantity?: InputMaybe<Scalars['Int']['input']>;
  unitPrice?: InputMaybe<Scalars['Float']['input']>;
  customerNote?: InputMaybe<Scalars['String']['input']>;
  deliveryAddress?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateCustomerOrderMutation = { __typename?: 'Mutation', updateCustomerOrder?: { __typename?: 'Order', id: number, orderNumber: string, status: OrderStatus, quantity: number, unitPrice: number, totalPrice: number, customerNote?: string | null, deliveryAddress?: string | null, updatedAt: any } | null };

export type CancelOrderMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type CancelOrderMutation = { __typename?: 'Mutation', cancelOrder?: { __typename?: 'Order', id: number, orderNumber: string, status: OrderStatus, updatedAt: any } | null };

export type DeleteOrderMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteOrderMutation = { __typename?: 'Mutation', deleteOrder?: { __typename?: 'Order', id: number, orderNumber: string } | null };

export type MyNotificationsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type MyNotificationsQuery = { __typename?: 'Query', myNotifications: Array<{ __typename?: 'Notification', id: number, type: NotificationType, title: string, message: string, link?: string | null, isRead: boolean, createdAt: any, updatedAt: any }> };

export type UnreadNotificationCountQueryVariables = Exact<{ [key: string]: never; }>;


export type UnreadNotificationCountQuery = { __typename?: 'Query', unreadNotificationCount: number };

export type MarkNotificationAsReadMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type MarkNotificationAsReadMutation = { __typename?: 'Mutation', markNotificationAsRead?: { __typename?: 'Notification', id: number, isRead: boolean } | null };

export type MarkAllNotificationsAsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsAsReadMutation = { __typename?: 'Mutation', markAllNotificationsAsRead: number };

export type DeleteNotificationMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteNotificationMutation = { __typename?: 'Mutation', deleteNotification?: { __typename?: 'Notification', id: number } | null };

export type UpdateProductionStageMutationVariables = Exact<{
  input: UpdateProductionStageInput;
}>;


export type UpdateProductionStageMutation = { __typename?: 'Mutation', updateProductionStage?: { __typename?: 'ProductionTracking', id: number, currentStage: ProductionStage, overallStatus: ProductionStatus, progress: number, estimatedStartDate?: string | null, estimatedEndDate?: string | null, actualStartDate?: string | null, actualEndDate?: string | null, notes?: string | null, createdAt: string, updatedAt: string } | null };

export type ProductionTrackingQueryVariables = Exact<{
  id?: InputMaybe<Scalars['Int']['input']>;
  orderId?: InputMaybe<Scalars['Int']['input']>;
  sampleId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ProductionTrackingQuery = { __typename?: 'Query', productionTracking?: { __typename?: 'ProductionTracking', id: number, orderId?: number | null, sampleId?: number | null, currentStage: ProductionStage, overallStatus: ProductionStatus, progress: number, estimatedStartDate?: string | null, estimatedEndDate?: string | null, actualStartDate?: string | null, actualEndDate?: string | null, notes?: string | null, createdAt: string, updatedAt: string, companyId?: number | null, order?: { __typename?: 'Order', id: number, orderNumber: string, manufacture?: { __typename?: 'User', id: number } | null, company?: { __typename?: 'Company', id: number } | null } | null, sample?: { __typename?: 'Sample', id: number, sampleNumber: string, manufacture?: { __typename?: 'User', id: number } | null, company?: { __typename?: 'Company', id: number } | null } | null, stageUpdates?: Array<{ __typename?: 'ProductionStageUpdate', id: number, stage: ProductionStage, status: StageStatus, actualStartDate?: string | null, actualEndDate?: string | null, estimatedDays?: number | null, notes?: string | null, photos?: string | null, isRevision: boolean, extraDays: number, createdAt: string } | null> | null, qualityControls?: Array<{ __typename?: 'QualityControl', id: number, checkDate: string, result: QualityResult, score?: number | null, notes?: string | null, photos?: string | null, fabricDefects: boolean, sewingDefects: boolean, measureDefects: boolean, finishingDefects: boolean, createdAt: string, inspector?: { __typename?: 'User', id: number, firstName?: string | null, lastName?: string | null } | null } | null> | null } | null };

export type AddProductionStageUpdateMutationVariables = Exact<{
  productionId: Scalars['Int']['input'];
  stage: ProductionStage;
  notes?: InputMaybe<Scalars['String']['input']>;
  photos?: InputMaybe<Scalars['String']['input']>;
  hasDelay: Scalars['Boolean']['input'];
  delayReason?: InputMaybe<Scalars['String']['input']>;
  extraDays?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AddProductionStageUpdateMutation = { __typename?: 'Mutation', addProductionStageUpdate?: { __typename?: 'ProductionStageUpdate', id: number, productionId: number, stage: ProductionStage, status: StageStatus, notes?: string | null, photos?: string | null, isRevision: boolean, extraDays: number, createdAt: string } | null };

export type CompleteProductionStageMutationVariables = Exact<{
  productionId: Scalars['Int']['input'];
  stage: ProductionStage;
}>;


export type CompleteProductionStageMutation = { __typename?: 'Mutation', completeProductionStage?: { __typename?: 'ProductionTracking', id: number, currentStage: ProductionStage, overallStatus: ProductionStatus, progress: number } | null };

export type RevertProductionStageMutationVariables = Exact<{
  productionId: Scalars['Int']['input'];
  targetStage: ProductionStage;
}>;


export type RevertProductionStageMutation = { __typename?: 'Mutation', revertProductionStage?: { __typename?: 'ProductionTracking', id: number, currentStage: ProductionStage, overallStatus: ProductionStatus, progress: number } | null };

export type AskQuestionMutationVariables = Exact<{
  input: CreateQuestionInput;
}>;


export type AskQuestionMutation = { __typename?: 'Mutation', askQuestion?: { __typename?: 'Question', id: number, question: string, answer?: string | null, isAnswered: boolean, isPublic: boolean, collectionId: number, createdAt: string, customer?: { __typename?: 'User', id: number, firstName?: string | null, lastName?: string | null, name?: string | null } | null, manufacture?: { __typename?: 'User', id: number, firstName?: string | null, lastName?: string | null, name?: string | null } | null } | null };

export type AnswerQuestionMutationVariables = Exact<{
  input: AnswerQuestionInput;
}>;


export type AnswerQuestionMutation = { __typename?: 'Mutation', answerQuestion?: { __typename?: 'Question', id: number, question: string, answer?: string | null, isAnswered: boolean, createdAt: string } | null };

export type DeleteQuestionMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteQuestionMutation = { __typename?: 'Mutation', deleteQuestion?: { __typename?: 'Question', id: number } | null };

export type CollectionQuestionsQueryVariables = Exact<{
  collectionId?: InputMaybe<Scalars['Int']['input']>;
  includePrivate?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CollectionQuestionsQuery = { __typename?: 'Query', collectionQuestions?: Array<{ __typename?: 'Question', id: number, question: string, answer?: string | null, isAnswered: boolean, isPublic: boolean, createdAt: string, customer?: { __typename?: 'User', id: number, firstName?: string | null, lastName?: string | null, name?: string | null } | null, manufacture?: { __typename?: 'User', id: number, firstName?: string | null, lastName?: string | null, name?: string | null } | null } | null> | null };

export type MyQuestionsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyQuestionsQuery = { __typename?: 'Query', myQuestions?: Array<{ __typename?: 'Question', id: number, question: string, answer?: string | null, isAnswered: boolean, isPublic: boolean, collectionId: number, createdAt: string, collection?: { __typename?: 'Collection', id: number, name: string } | null, customer?: { __typename?: 'User', id: number, firstName?: string | null, lastName?: string | null } | null } | null> | null };

export type UnansweredQuestionsQueryVariables = Exact<{ [key: string]: never; }>;


export type UnansweredQuestionsQuery = { __typename?: 'Query', unansweredQuestions?: Array<{ __typename?: 'Question', id: number, question: string, collectionId: number, createdAt: string, collection?: { __typename?: 'Collection', id: number, name: string } | null, customer?: { __typename?: 'User', id: number, firstName?: string | null, lastName?: string | null, email: string } | null } | null> | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: number, email: string, name?: string | null, firstName?: string | null, lastName?: string | null, role: Role, companyId?: number | null, isCompanyOwner: boolean, isPendingApproval: boolean, department?: string | null, jobTitle?: string | null, permissions?: string | null, isActive: boolean, createdAt: string, updatedAt: string, company?: { __typename?: 'Company', id: number, name: string, type: CompanyType, email: string } | null } | null };

export type AllUsersQueryVariables = Exact<{
  searchString?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Role>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AllUsersQuery = { __typename?: 'Query', allUsers: Array<{ __typename?: 'User', companyId?: number | null, createdAt: string, email: string, firstName?: string | null, id: number, username?: string | null, updatedAt: string, role: Role, phone?: string | null, name?: string | null, lastName?: string | null, isActive: boolean, company?: { __typename?: 'Company', address?: string | null, createdAt: string, description?: string | null, email: string, id: number, isActive: boolean, name: string, phone?: string | null, updatedAt: string, website?: string | null } | null }> };

export type AllManufacturersQueryVariables = Exact<{ [key: string]: never; }>;


export type AllManufacturersQuery = { __typename?: 'Query', allManufacturers?: Array<{ __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string, phone?: string | null, companyId?: number | null, company?: { __typename?: 'Company', id: number, name: string } | null } | null> | null };

export type AllCompaniesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllCompaniesQuery = { __typename?: 'Query', allCompanies?: Array<{ __typename?: 'Company', id: number, name: string, email: string, phone?: string | null, address?: string | null, website?: string | null, isActive: boolean, createdAt: string, updatedAt: string, users?: Array<{ __typename?: 'User', id: number, name?: string | null, email: string } | null> | null } | null> | null };

export type AllCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllCategoriesQuery = { __typename?: 'Query', allCategories?: Array<{ __typename?: 'Category', id: number, name: string, description?: string | null, collectionsCount?: number | null, createdAt: string, updatedAt: string, author?: { __typename?: 'User', id: number, name?: string | null } | null, company?: { __typename?: 'Company', id: number, name: string } | null, parentCategory?: { __typename?: 'Category', id: number, name: string } | null, subCategories?: Array<{ __typename?: 'Category', id: number, name: string, collectionsCount?: number | null } | null> | null } | null> | null };

export type RootCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type RootCategoriesQuery = { __typename?: 'Query', rootCategories?: Array<{ __typename?: 'Category', id: number, name: string, description?: string | null, collectionsCount?: number | null, createdAt: string, updatedAt: string, author?: { __typename?: 'User', id: number, name?: string | null } | null, company?: { __typename?: 'Company', id: number, name: string } | null, subCategories?: Array<{ __typename?: 'Category', id: number, name: string, description?: string | null, collectionsCount?: number | null, subCategories?: Array<{ __typename?: 'Category', id: number, name: string, collectionsCount?: number | null } | null> | null } | null> | null } | null> | null };

export type CategoryTreeQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoryTreeQuery = { __typename?: 'Query', categoryTree?: Array<{ __typename?: 'Category', id: number, name: string, description?: string | null, collectionsCount?: number | null, author?: { __typename?: 'User', id: number, name?: string | null } | null, company?: { __typename?: 'Company', id: number, name: string } | null, subCategories?: Array<{ __typename?: 'Category', id: number, name: string, description?: string | null, collectionsCount?: number | null, subCategories?: Array<{ __typename?: 'Category', id: number, name: string, collectionsCount?: number | null } | null> | null } | null> | null } | null> | null };

export type CompanyQueryVariables = Exact<{
  companyId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CompanyQuery = { __typename?: 'Query', company?: { __typename?: 'Company', address?: string | null, createdAt: string, description?: string | null, email: string, id: number, isActive: boolean, name: string, phone?: string | null, updatedAt: string, website?: string | null, users?: Array<{ __typename?: 'User', id: number, firstName?: string | null, email: string, createdAt: string, companyId?: number | null, isActive: boolean, lastName?: string | null, name?: string | null, phone?: string | null, role: Role, updatedAt: string, username?: string | null } | null> | null } | null };

export type AllCollectionsQueryVariables = Exact<{
  categoryId?: InputMaybe<Scalars['Int']['input']>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AllCollectionsQuery = { __typename?: 'Query', collections?: Array<{ __typename?: 'Collection', id: number, name: string, description?: string | null, price: number, sku?: string | null, stock: number, images?: Array<string | null> | null, isActive: boolean, isFeatured: boolean, slug?: string | null, productionSchedule?: string | null, createdAt: any, updatedAt: any, modelCode: string, season?: Season | null, gender?: Gender | null, fit?: string | null, trend?: string | null, colors?: Array<string | null> | null, sizeRange?: string | null, measurementChart?: string | null, fabricComposition?: string | null, accessories?: string | null, techPack?: string | null, moq?: number | null, targetPrice?: number | null, targetLeadTime?: number | null, notes?: string | null, likesCount: number, samplesCount?: number | null, ordersCount?: number | null, category?: { __typename?: 'Category', id: number, name: string } | null, company?: { __typename?: 'Company', id: number, name: string, address?: string | null, location?: string | null } | null, author?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null } | null, certifications?: Array<{ __typename?: 'Certification', id: number, name: string, category: CertificationCategory, code?: string | null } | null> | null } | null> | null };

export type CollectionByIdQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type CollectionByIdQuery = { __typename?: 'Query', collection?: { __typename?: 'Collection', id: number, name: string, description?: string | null, price: number, sku?: string | null, stock: number, images?: Array<string | null> | null, isActive: boolean, isFeatured: boolean, slug?: string | null, productionSchedule?: string | null, createdAt: any, updatedAt: any, samplesCount?: number | null, ordersCount?: number | null, category?: { __typename?: 'Category', id: number, name: string, description?: string | null, company?: { __typename?: 'Company', id: number, name: string } | null } | null, company?: { __typename?: 'Company', id: number, name: string, email: string, website?: string | null } | null, author?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string } | null } | null };

export type CollectionsByCategoryQueryVariables = Exact<{
  categoryId: Scalars['Int']['input'];
  includeSubcategories?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CollectionsByCategoryQuery = { __typename?: 'Query', collectionsByCategory?: Array<{ __typename?: 'Collection', id: number, name: string, description?: string | null, price: number, sku?: string | null, stock: number, images?: Array<string | null> | null, isActive: boolean, isFeatured: boolean, slug?: string | null, productionSchedule?: string | null, createdAt: any, samplesCount?: number | null, ordersCount?: number | null, category?: { __typename?: 'Category', id: number, name: string } | null, company?: { __typename?: 'Company', id: number, name: string } | null, author?: { __typename?: 'User', id: number, name?: string | null } | null } | null> | null };

export type MyCollectionsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyCollectionsQuery = { __typename?: 'Query', myCollections?: Array<{ __typename?: 'Collection', id: number, name: string, description?: string | null, price: number, sku?: string | null, stock: number, images?: Array<string | null> | null, isActive: boolean, isFeatured: boolean, slug?: string | null, productionSchedule?: string | null, createdAt: any, updatedAt: any, samplesCount?: number | null, ordersCount?: number | null, category?: { __typename?: 'Category', id: number, name: string } | null, company?: { __typename?: 'Company', id: number, name: string } | null, author?: { __typename?: 'User', id: number, name?: string | null } | null } | null> | null };

export type FeaturedCollectionsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type FeaturedCollectionsQuery = { __typename?: 'Query', featuredCollections?: Array<{ __typename?: 'Collection', id: number, name: string, description?: string | null, price: number, sku?: string | null, stock: number, images?: Array<string | null> | null, isActive: boolean, isFeatured: boolean, slug?: string | null, productionSchedule?: string | null, createdAt: any, samplesCount?: number | null, ordersCount?: number | null, category?: { __typename?: 'Category', id: number, name: string } | null, company?: { __typename?: 'Company', id: number, name: string } | null, author?: { __typename?: 'User', id: number, name?: string | null } | null } | null> | null };

export type AllSamplesQueryVariables = Exact<{
  status?: InputMaybe<SampleStatus>;
  sampleType?: InputMaybe<SampleType>;
  customerId?: InputMaybe<Scalars['Int']['input']>;
  manufactureId?: InputMaybe<Scalars['Int']['input']>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AllSamplesQuery = { __typename?: 'Query', samples?: Array<{ __typename?: 'Sample', id: number, sampleNumber: string, sampleType: SampleType, status: SampleStatus, customerNote?: string | null, manufacturerResponse?: string | null, productionDays?: number | null, estimatedProductionDate?: any | null, actualProductionDate?: any | null, shippingDate?: any | null, cargoTrackingNumber?: string | null, deliveryAddress?: string | null, createdAt: any, updatedAt: any, collection?: { __typename?: 'Collection', id: number, name: string, images?: Array<string | null> | null } | null, originalCollection?: { __typename?: 'Collection', id: number, name: string } | null, customer?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string } | null, manufacture?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string } | null, company?: { __typename?: 'Company', id: number, name: string } | null } | null> | null };

export type SampleByIdQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type SampleByIdQuery = { __typename?: 'Query', sample?: { __typename?: 'Sample', id: number, sampleNumber: string, sampleType: SampleType, status: SampleStatus, customerNote?: string | null, manufacturerResponse?: string | null, customDesignImages?: string | null, revisionRequests?: string | null, originalCollectionId?: number | null, productionDays?: number | null, estimatedProductionDate?: any | null, actualProductionDate?: any | null, shippingDate?: any | null, cargoTrackingNumber?: string | null, deliveryAddress?: string | null, createdAt: any, updatedAt: any, collection?: { __typename?: 'Collection', id: number, name: string, description?: string | null, price: number, images?: Array<string | null> | null, category?: { __typename?: 'Category', id: number, name: string } | null } | null, originalCollection?: { __typename?: 'Collection', id: number, name: string, images?: Array<string | null> | null } | null, customer?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string, phone?: string | null } | null, manufacture?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string, phone?: string | null } | null, company?: { __typename?: 'Company', id: number, name: string, email: string, phone?: string | null } | null } | null };

export type MySamplesQueryVariables = Exact<{
  status?: InputMaybe<SampleStatus>;
  sampleType?: InputMaybe<SampleType>;
}>;


export type MySamplesQuery = { __typename?: 'Query', mySamples?: Array<{ __typename?: 'Sample', id: number, sampleNumber: string, sampleType: SampleType, status: SampleStatus, customerNote?: string | null, manufacturerResponse?: string | null, productionDays?: number | null, estimatedProductionDate?: any | null, actualProductionDate?: any | null, createdAt: any, updatedAt: any, collection?: { __typename?: 'Collection', id: number, name: string, images?: Array<string | null> | null, modelCode: string } | null, originalCollection?: { __typename?: 'Collection', id: number, name: string } | null, customer?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string } | null, manufacture?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string, company?: { __typename?: 'Company', id: number, name: string } | null } | null } | null> | null };

export type AssignedSamplesQueryVariables = Exact<{
  status?: InputMaybe<SampleStatus>;
  sampleType?: InputMaybe<SampleType>;
}>;


export type AssignedSamplesQuery = { __typename?: 'Query', assignedSamples?: Array<{ __typename?: 'Sample', id: number, sampleNumber: string, sampleType: SampleType, status: SampleStatus, customerNote?: string | null, productionDays?: number | null, estimatedProductionDate?: any | null, createdAt: any, collection?: { __typename?: 'Collection', id: number, name: string, images?: Array<string | null> | null } | null, customer?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string } | null } | null> | null };

export type SampleProductionHistoryQueryVariables = Exact<{
  sampleId: Scalars['Int']['input'];
}>;


export type SampleProductionHistoryQuery = { __typename?: 'Query', sampleProductionHistory?: Array<{ __typename?: 'SampleProduction', id: number, status: SampleStatus, note?: string | null, estimatedDays?: number | null, actualDate?: any | null, createdAt: any, updatedBy?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null } | null } | null> | null };

export type AllOrdersQueryVariables = Exact<{
  status?: InputMaybe<OrderStatus>;
  customerId?: InputMaybe<Scalars['Int']['input']>;
  manufactureId?: InputMaybe<Scalars['Int']['input']>;
  companyId?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AllOrdersQuery = { __typename?: 'Query', orders?: Array<{ __typename?: 'Order', id: number, orderNumber: string, status: OrderStatus, quantity: number, unitPrice: number, totalPrice: number, customerNote?: string | null, manufacturerResponse?: string | null, productionDays?: number | null, estimatedProductionDate?: any | null, actualProductionStart?: any | null, actualProductionEnd?: any | null, shippingDate?: any | null, cargoTrackingNumber?: string | null, createdAt: any, updatedAt: any, collection?: { __typename?: 'Collection', id: number, name: string, modelCode: string, images?: Array<string | null> | null } | null, customer?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string } | null, manufacture?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string, company?: { __typename?: 'Company', id: number, name: string } | null } | null, company?: { __typename?: 'Company', id: number, name: string } | null } | null> | null };

export type OrderByIdQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type OrderByIdQuery = { __typename?: 'Query', order?: { __typename?: 'Order', id: number, orderNumber: string, status: OrderStatus, quantity: number, unitPrice: number, totalPrice: number, customerNote?: string | null, manufacturerResponse?: string | null, specifications?: string | null, deliveryAddress?: string | null, cargoTrackingNumber?: string | null, productionDays?: number | null, estimatedProductionDate?: any | null, actualProductionStart?: any | null, actualProductionEnd?: any | null, shippingDate?: any | null, createdAt: any, updatedAt: any, collection?: { __typename?: 'Collection', id: number, name: string, description?: string | null, price: number, images?: Array<string | null> | null } | null, customer?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string, phone?: string | null } | null, manufacture?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string, phone?: string | null } | null, company?: { __typename?: 'Company', id: number, name: string } | null } | null };

export type MyOrdersQueryVariables = Exact<{
  status?: InputMaybe<OrderStatus>;
}>;


export type MyOrdersQuery = { __typename?: 'Query', myOrders?: Array<{ __typename?: 'Order', id: number, orderNumber: string, status: OrderStatus, quantity: number, unitPrice: number, totalPrice: number, productionDays?: number | null, estimatedProductionDate?: any | null, actualProductionStart?: any | null, customerNote?: string | null, manufacturerResponse?: string | null, createdAt: any, updatedAt: any, collection?: { __typename?: 'Collection', id: number, name: string, modelCode: string, images?: Array<string | null> | null } | null, customer?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string } | null, manufacture?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string, company?: { __typename?: 'Company', id: number, name: string } | null } | null } | null> | null };

export type AssignedOrdersQueryVariables = Exact<{
  status?: InputMaybe<OrderStatus>;
}>;


export type AssignedOrdersQuery = { __typename?: 'Query', assignedOrders?: Array<{ __typename?: 'Order', id: number, orderNumber: string, status: OrderStatus, quantity: number, unitPrice: number, totalPrice: number, productionDays?: number | null, estimatedProductionDate?: any | null, actualProductionStart?: any | null, customerNote?: string | null, manufacturerResponse?: string | null, createdAt: any, collection?: { __typename?: 'Collection', id: number, name: string, modelCode: string, images?: Array<string | null> | null } | null, customer?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string } | null, manufacture?: { __typename?: 'User', id: number, name?: string | null, firstName?: string | null, lastName?: string | null, email: string, company?: { __typename?: 'Company', id: number, name: string } | null } | null } | null> | null };

export type PublicPlatformStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type PublicPlatformStatsQuery = { __typename?: 'Query', publicPlatformStats?: { __typename?: 'PublicPlatformStats', totalProducts: number, activeManufacturers: number, activeWorkshops: number, totalCollections: number, totalOrders: number, collectionsByGender: { __typename?: 'CollectionGenderBreakdown', men: number, women: number, unisex: number }, collectionsByCategory?: Array<{ __typename?: 'CategoryBreakdown', category: string, count: number, men: number, women: number, unisex: number } | null> | null, sustainability: { __typename?: 'SustainabilityMetrics', carbonFootprintReduction: number, recycledMaterialUsage: number, certifiedOrganicProducts: number, gotsChronumCertified: number, waterSavedLiters: number }, suppliersByCountry?: Array<{ __typename?: 'CountrySuppliers', country: string, count: number, companies?: Array<{ __typename?: 'SupplierInfo', name: string, city?: string | null } | null> | null } | null> | null, platformFeatures?: Array<{ __typename?: 'PlatformFeature', title: string, description: string, icon: string } | null> | null, recentActivity: { __typename?: 'RecentActivity', newCollectionsThisWeek: number, completedOrdersThisMonth: number, newManufacturersThisMonth: number, activeProductionsNow: number, latestCollections?: Array<{ __typename?: 'LatestCollection', name: string, gender: string, createdAt: string } | null> | null }, testimonials?: Array<{ __typename?: 'Testimonial', name: string, role: string, rating: number, comment: string } | null> | null, growthMetrics: { __typename?: 'GrowthMetrics', monthlyGrowthRate: number, totalTransactionVolume: number, avgDeliveryDays: number, customerSatisfactionRate: number } } | null };

export type CreateReviewMutationVariables = Exact<{
  input: CreateReviewInput;
}>;


export type CreateReviewMutation = { __typename?: 'Mutation', createReview?: { __typename?: 'Review', id: number, rating: number, comment?: string | null, isApproved: boolean, collectionId: number, createdAt: string, customer?: { __typename?: 'User', id: number, firstName?: string | null, lastName?: string | null, name?: string | null } | null } | null };

export type ApproveReviewMutationVariables = Exact<{
  input: ApproveReviewInput;
}>;


export type ApproveReviewMutation = { __typename?: 'Mutation', approveReview?: { __typename?: 'Review', id: number, isApproved: boolean } | null };

export type DeleteReviewMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteReviewMutation = { __typename?: 'Mutation', deleteReview?: { __typename?: 'Review', id: number } | null };

export type CollectionReviewsQueryVariables = Exact<{
  collectionId?: InputMaybe<Scalars['Int']['input']>;
  approvedOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CollectionReviewsQuery = { __typename?: 'Query', collectionReviews?: Array<{ __typename?: 'Review', id: number, rating: number, comment?: string | null, isApproved: boolean, createdAt: string, customer?: { __typename?: 'User', id: number, firstName?: string | null, lastName?: string | null, name?: string | null, company?: { __typename?: 'Company', id: number, name: string } | null } | null } | null> | null };

export type CollectionAverageRatingQueryVariables = Exact<{
  collectionId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CollectionAverageRatingQuery = { __typename?: 'Query', collectionAverageRating?: number | null };

export type MyReviewsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyReviewsQuery = { __typename?: 'Query', myReviews?: Array<{ __typename?: 'Review', id: number, rating: number, comment?: string | null, isApproved: boolean, collectionId: number, createdAt: string, collection?: { __typename?: 'Collection', id: number, name: string } | null } | null> | null };

export type PendingReviewsQueryVariables = Exact<{ [key: string]: never; }>;


export type PendingReviewsQuery = { __typename?: 'Query', pendingReviews?: Array<{ __typename?: 'Review', id: number, rating: number, comment?: string | null, collectionId: number, createdAt: string, collection?: { __typename?: 'Collection', id: number, name: string } | null, customer?: { __typename?: 'User', id: number, firstName?: string | null, lastName?: string | null, email: string } | null } | null> | null };

export type WorkshopsQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkshopsQuery = { __typename?: 'Query', workshops?: Array<{ __typename?: 'Workshop', id: number, name: string, type: WorkshopType, capacity?: number | null, location?: string | null, isActive: boolean, activeProductionCount?: number | null, totalProductionCount?: number | null, utilizationRate?: number | null, owner?: { __typename?: 'User', id: number, name?: string | null } | null } | null> | null };

export type WorkshopQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type WorkshopQuery = { __typename?: 'Query', workshop?: { __typename?: 'Workshop', id: number, name: string, type: WorkshopType, capacity?: number | null, location?: string | null, isActive: boolean, activeProductionCount?: number | null, totalProductionCount?: number | null, utilizationRate?: number | null, owner?: { __typename?: 'User', id: number, name?: string | null } | null, sewingProductions?: Array<{ __typename?: 'ProductionTracking', id: number, currentStage: ProductionStage } | null> | null, packagingProductions?: Array<{ __typename?: 'ProductionTracking', id: number, currentStage: ProductionStage } | null> | null } | null };

export type MyWorkshopsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyWorkshopsQuery = { __typename?: 'Query', myWorkshops?: Array<{ __typename?: 'Workshop', id: number, name: string, type: WorkshopType, capacity?: number | null, location?: string | null, isActive: boolean, activeProductionCount?: number | null, totalProductionCount?: number | null, utilizationRate?: number | null } | null> | null };

export type WorkshopStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkshopStatsQuery = { __typename?: 'Query', workshopStats?: { __typename?: 'WorkshopStats', totalWorkshops: number, totalProductions: number, activeProductions: number, completedProductions: number, utilizationRate: number } | null };

export type CreateWorkshopMutationVariables = Exact<{
  input: CreateWorkshopInput;
}>;


export type CreateWorkshopMutation = { __typename?: 'Mutation', createWorkshop?: { __typename?: 'Workshop', id: number, name: string, type: WorkshopType, capacity?: number | null, location?: string | null, isActive: boolean } | null };

export type UpdateWorkshopMutationVariables = Exact<{
  input: UpdateWorkshopInput;
}>;


export type UpdateWorkshopMutation = { __typename?: 'Mutation', updateWorkshop?: { __typename?: 'Workshop', id: number, name: string, type: WorkshopType, capacity?: number | null, location?: string | null, isActive: boolean } | null };

export type DeleteWorkshopMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteWorkshopMutation = { __typename?: 'Mutation', deleteWorkshop?: { __typename?: 'Workshop', id: number, name: string } | null };

export type AssignWorkshopToProductionMutationVariables = Exact<{
  productionId: Scalars['Int']['input'];
  sewingWorkshopId?: InputMaybe<Scalars['Int']['input']>;
  packagingWorkshopId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AssignWorkshopToProductionMutation = { __typename?: 'Mutation', assignWorkshopToProduction?: { __typename?: 'ProductionTracking', id: number, currentStage: ProductionStage, sewingWorkshopId?: number | null, packagingWorkshopId?: number | null } | null };

export type GetAiSamplesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAiSamplesQuery = { __typename?: 'Query', samples?: Array<{ __typename?: 'Sample', id: number, sampleNumber: string, name?: string | null, description?: string | null, status: SampleStatus, images?: string | null, aiGenerated?: boolean | null, aiPrompt?: string | null, aiSketchUrl?: string | null, createdAt: any } | null> | null };

export type GenerateDesignFromTextMutationVariables = Exact<{
  prompt: Scalars['String']['input'];
  negativePrompt?: InputMaybe<Scalars['String']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  steps?: InputMaybe<Scalars['Int']['input']>;
  cfgScale?: InputMaybe<Scalars['Float']['input']>;
  collectionId?: InputMaybe<Scalars['Int']['input']>;
  sampleName?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  workflowName?: InputMaybe<Scalars['String']['input']>;
}>;


export type GenerateDesignFromTextMutation = { __typename?: 'Mutation', generateDesignFromText?: { __typename?: 'Sample', id: number, sampleNumber: string, name?: string | null, description?: string | null, status: SampleStatus, images?: string | null, aiGenerated?: boolean | null, aiPrompt?: string | null, aiSketchUrl?: string | null, createdAt: any } | null };

export type AnalyzeProductWithOllamaMutationVariables = Exact<{
  imageUrl: Scalars['String']['input'];
  userNotes?: InputMaybe<Scalars['String']['input']>;
}>;


export type AnalyzeProductWithOllamaMutation = { __typename?: 'Mutation', analyzeProductWithOllama?: { __typename?: 'ProductAnalysisResult', productType: string, category: string, colors: Array<string>, material: string, pattern: string, style: string, neckline?: string | null, sleeves?: string | null, fit?: string | null, details: Array<string>, designPrompt: string, rawResponse?: string | null, suggestedModels: Array<{ __typename?: 'SuggestedModel', variant: string, prompt: string }> } | null };


export const MyCategoriesDocument = gql`
    query MyCategories {
  myCategories {
    id
    name
    description
    createdAt
    parentCategory {
      id
      name
    }
    company {
      id
      name
    }
    author {
      id
      firstName
      lastName
    }
    subCategories {
      id
      name
      description
    }
  }
}
    `;

export function useMyCategoriesQuery(options?: Omit<Urql.UseQueryArgs<MyCategoriesQueryVariables>, 'query'>) {
  return Urql.useQuery<MyCategoriesQuery, MyCategoriesQueryVariables>({ query: MyCategoriesDocument, ...options });
};
export const CreateCategoryInPageDocument = gql`
    mutation CreateCategoryInPage($name: String!, $description: String, $parentCategoryId: Int) {
  createCategory(
    name: $name
    description: $description
    parentCategoryId: $parentCategoryId
  ) {
    id
    name
    description
  }
}
    `;

export function useCreateCategoryInPageMutation() {
  return Urql.useMutation<CreateCategoryInPageMutation, CreateCategoryInPageMutationVariables>(CreateCategoryInPageDocument);
};
export const UpdateCategoryInPageDocument = gql`
    mutation UpdateCategoryInPage($id: Int!, $name: String, $description: String, $parentCategoryId: Int) {
  updateCategory(
    id: $id
    name: $name
    description: $description
    parentCategoryId: $parentCategoryId
  ) {
    id
    name
    description
  }
}
    `;

export function useUpdateCategoryInPageMutation() {
  return Urql.useMutation<UpdateCategoryInPageMutation, UpdateCategoryInPageMutationVariables>(UpdateCategoryInPageDocument);
};
export const DeleteCategoryInPageDocument = gql`
    mutation DeleteCategoryInPage($id: Int!) {
  deleteCategory(id: $id) {
    id
  }
}
    `;

export function useDeleteCategoryInPageMutation() {
  return Urql.useMutation<DeleteCategoryInPageMutation, DeleteCategoryInPageMutationVariables>(DeleteCategoryInPageDocument);
};
export const CompanyDetailsDocument = gql`
    query CompanyDetails($id: Int!) {
  company(id: $id) {
    id
    name
    email
    phone
    address
    website
    type
    description
    isActive
    createdAt
  }
}
    `;

export function useCompanyDetailsQuery(options: Omit<Urql.UseQueryArgs<CompanyDetailsQueryVariables>, 'query'>) {
  return Urql.useQuery<CompanyDetailsQuery, CompanyDetailsQueryVariables>({ query: CompanyDetailsDocument, ...options });
};
export const UpdateCompanySettingsDocument = gql`
    mutation UpdateCompanySettings($id: Int!, $name: String, $email: String, $phone: String, $address: String, $website: String, $description: String) {
  updateCompany(
    id: $id
    name: $name
    email: $email
    phone: $phone
    address: $address
    website: $website
    description: $description
  ) {
    id
    name
    email
  }
}
    `;

export function useUpdateCompanySettingsMutation() {
  return Urql.useMutation<UpdateCompanySettingsMutation, UpdateCompanySettingsMutationVariables>(UpdateCompanySettingsDocument);
};
export const MyCompanyEmployeesDocument = gql`
    query MyCompanyEmployees {
  myCompanyEmployees {
    id
    email
    firstName
    lastName
    phone
    role
    department
    jobTitle
    isCompanyOwner
    isActive
    createdAt
    company {
      id
      name
    }
  }
}
    `;

export function useMyCompanyEmployeesQuery(options?: Omit<Urql.UseQueryArgs<MyCompanyEmployeesQueryVariables>, 'query'>) {
  return Urql.useQuery<MyCompanyEmployeesQuery, MyCompanyEmployeesQueryVariables>({ query: MyCompanyEmployeesDocument, ...options });
};
export const CreateEmployeeDocument = gql`
    mutation CreateEmployee($input: SignupInput!) {
  signup(input: $input) {
    user {
      id
      email
      firstName
      lastName
    }
  }
}
    `;

export function useCreateEmployeeMutation() {
  return Urql.useMutation<CreateEmployeeMutation, CreateEmployeeMutationVariables>(CreateEmployeeDocument);
};
export const UpdateEmployeeDocument = gql`
    mutation UpdateEmployee($input: UserUpdateInput!) {
  updateUser(input: $input) {
    id
    email
    firstName
    lastName
  }
}
    `;

export function useUpdateEmployeeMutation() {
  return Urql.useMutation<UpdateEmployeeMutation, UpdateEmployeeMutationVariables>(UpdateEmployeeDocument);
};
export const DeleteEmployeeDocument = gql`
    mutation DeleteEmployee($id: Int!) {
  deleteUser(id: $id) {
    id
  }
}
    `;

export function useDeleteEmployeeMutation() {
  return Urql.useMutation<DeleteEmployeeMutation, DeleteEmployeeMutationVariables>(DeleteEmployeeDocument);
};
export const MyCertificationsDocument = gql`
    query MyCertifications {
  myCertifications {
    id
    name
    code
    category
    issuer
    validFrom
    validUntil
    certificateNumber
    certificateFile
    description
    isActive
  }
}
    `;

export function useMyCertificationsQuery(options?: Omit<Urql.UseQueryArgs<MyCertificationsQueryVariables>, 'query'>) {
  return Urql.useQuery<MyCertificationsQuery, MyCertificationsQueryVariables>({ query: MyCertificationsDocument, ...options });
};
export const CreateCertificationDocument = gql`
    mutation CreateCertification($name: String!, $code: String, $category: CertificationCategory!, $issuer: String, $validFrom: DateTime, $validUntil: DateTime, $certificateNumber: String, $certificateFile: String, $description: String) {
  createCertification(
    name: $name
    code: $code
    category: $category
    issuer: $issuer
    validFrom: $validFrom
    validUntil: $validUntil
    certificateNumber: $certificateNumber
    certificateFile: $certificateFile
    description: $description
  ) {
    id
    name
  }
}
    `;

export function useCreateCertificationMutation() {
  return Urql.useMutation<CreateCertificationMutation, CreateCertificationMutationVariables>(CreateCertificationDocument);
};
export const UpdateCertificationDocument = gql`
    mutation UpdateCertification($id: Int!, $name: String, $code: String, $category: CertificationCategory, $issuer: String, $validFrom: DateTime, $validUntil: DateTime, $certificateNumber: String, $certificateFile: String, $description: String, $isActive: Boolean) {
  updateCertification(
    id: $id
    name: $name
    code: $code
    category: $category
    issuer: $issuer
    validFrom: $validFrom
    validUntil: $validUntil
    certificateNumber: $certificateNumber
    certificateFile: $certificateFile
    description: $description
    isActive: $isActive
  ) {
    id
    name
  }
}
    `;

export function useUpdateCertificationMutation() {
  return Urql.useMutation<UpdateCertificationMutation, UpdateCertificationMutationVariables>(UpdateCertificationDocument);
};
export const DeleteCertificationDocument = gql`
    mutation DeleteCertification($id: Int!) {
  deleteCertification(id: $id) {
    id
  }
}
    `;

export function useDeleteCertificationMutation() {
  return Urql.useMutation<DeleteCertificationMutation, DeleteCertificationMutationVariables>(DeleteCertificationDocument);
};
export const PendingStageApprovalsDocument = gql`
    query PendingStageApprovals {
  allProductionTracking {
    id
    currentStage
    overallStatus
    estimatedEndDate
    order {
      id
      orderNumber
    }
    sample {
      id
      sampleNumber
    }
    stageUpdates {
      id
      stage
      status
      estimatedDays
      actualStartDate
    }
  }
}
    `;

export function usePendingStageApprovalsQuery(options?: Omit<Urql.UseQueryArgs<PendingStageApprovalsQueryVariables>, 'query'>) {
  return Urql.useQuery<PendingStageApprovalsQuery, PendingStageApprovalsQueryVariables>({ query: PendingStageApprovalsDocument, ...options });
};
export const GenerateSampleDesignDocument = gql`
    mutation GenerateSampleDesign($sketchUrl: String!, $prompt: String!, $negativePrompt: String, $width: Int, $height: Int, $steps: Int, $cfgScale: Float, $collectionId: Int, $sampleName: String, $description: String) {
  generateSampleDesign(
    sketchUrl: $sketchUrl
    prompt: $prompt
    negativePrompt: $negativePrompt
    width: $width
    height: $height
    steps: $steps
    cfgScale: $cfgScale
    collectionId: $collectionId
    sampleName: $sampleName
    description: $description
  ) {
    id
    sampleNumber
    name
    description
    status
    images
    aiGenerated
    aiPrompt
    aiSketchUrl
    createdAt
  }
}
    `;

export function useGenerateSampleDesignMutation() {
  return Urql.useMutation<GenerateSampleDesignMutation, GenerateSampleDesignMutationVariables>(GenerateSampleDesignDocument);
};
export const DashboardStatsDocument = gql`
    query DashboardStats($period: String) {
  dashboardStats(period: $period) {
    totalCollections
    totalSamples
    totalOrders
    totalProductions
    pendingSamples
    activeSamples
    completedSamples
    pendingOrders
    activeOrders
    completedOrders
    activeProductions
    completedProductions
    totalMessages
    unreadMessages
    passedQC
    failedQC
    qcPassRate
    recentSamples {
      id
      sampleNumber
      status
      createdAt
      collection {
        id
        name
      }
    }
    recentOrders {
      id
      orderNumber
      status
      quantity
      totalPrice
      createdAt
    }
    recentProductions {
      id
      currentStage
      createdAt
      order {
        id
        orderNumber
      }
    }
    monthlyStats {
      month
      samples
      orders
      completedProductions
      revenue
    }
  }
}
    `;

export function useDashboardStatsQuery(options?: Omit<Urql.UseQueryArgs<DashboardStatsQueryVariables>, 'query'>) {
  return Urql.useQuery<DashboardStatsQuery, DashboardStatsQueryVariables>({ query: DashboardStatsDocument, ...options });
};
export const ProductionAnalyticsDocument = gql`
    query ProductionAnalytics {
  productionAnalytics {
    totalInProgress
    totalCompleted
    avgProductionDays
    stageBreakdown {
      stage
      count
    }
  }
}
    `;

export function useProductionAnalyticsQuery(options?: Omit<Urql.UseQueryArgs<ProductionAnalyticsQueryVariables>, 'query'>) {
  return Urql.useQuery<ProductionAnalyticsQuery, ProductionAnalyticsQueryVariables>({ query: ProductionAnalyticsDocument, ...options });
};
export const UserStatsDocument = gql`
    query UserStats {
  userStats {
    totalUsers
    adminCount
    manufactureCount
    customerCount
  }
}
    `;

export function useUserStatsQuery(options?: Omit<Urql.UseQueryArgs<UserStatsQueryVariables>, 'query'>) {
  return Urql.useQuery<UserStatsQuery, UserStatsQueryVariables>({ query: UserStatsDocument, ...options });
};
export const MyStatsDocument = gql`
    query MyStats {
  mySamples {
    id
    status
    createdAt
  }
  myOrders {
    id
    status
    totalPrice
    createdAt
  }
}
    `;

export function useMyStatsQuery(options?: Omit<Urql.UseQueryArgs<MyStatsQueryVariables>, 'query'>) {
  return Urql.useQuery<MyStatsQuery, MyStatsQueryVariables>({ query: MyStatsDocument, ...options });
};
export const MyColorsDocument = gql`
    query MyColors {
  myColors {
    id
    name
    code
    hexCode
    imageUrl
    isActive
    createdAt
  }
}
    `;

export function useMyColorsQuery(options?: Omit<Urql.UseQueryArgs<MyColorsQueryVariables>, 'query'>) {
  return Urql.useQuery<MyColorsQuery, MyColorsQueryVariables>({ query: MyColorsDocument, ...options });
};
export const CreateColorDocument = gql`
    mutation CreateColor($input: CreateColorInput!) {
  createColor(input: $input) {
    id
    name
    code
    hexCode
  }
}
    `;

export function useCreateColorMutation() {
  return Urql.useMutation<CreateColorMutation, CreateColorMutationVariables>(CreateColorDocument);
};
export const UpdateColorDocument = gql`
    mutation UpdateColor($input: UpdateColorInput!) {
  updateColor(input: $input) {
    id
    name
    code
    hexCode
  }
}
    `;

export function useUpdateColorMutation() {
  return Urql.useMutation<UpdateColorMutation, UpdateColorMutationVariables>(UpdateColorDocument);
};
export const DeleteColorDocument = gql`
    mutation DeleteColor($id: Int!) {
  deleteColor(id: $id) {
    id
  }
}
    `;

export function useDeleteColorMutation() {
  return Urql.useMutation<DeleteColorMutation, DeleteColorMutationVariables>(DeleteColorDocument);
};
export const MyFabricsDocument = gql`
    query MyFabrics {
  myFabrics {
    id
    name
    code
    composition
    weight
    width
    supplier
    price
    minOrder
    leadTime
    imageUrl
    description
    isActive
    createdAt
  }
}
    `;

export function useMyFabricsQuery(options?: Omit<Urql.UseQueryArgs<MyFabricsQueryVariables>, 'query'>) {
  return Urql.useQuery<MyFabricsQuery, MyFabricsQueryVariables>({ query: MyFabricsDocument, ...options });
};
export const CreateFabricDocument = gql`
    mutation CreateFabric($input: CreateFabricInput!) {
  createFabric(input: $input) {
    id
    name
    code
    composition
  }
}
    `;

export function useCreateFabricMutation() {
  return Urql.useMutation<CreateFabricMutation, CreateFabricMutationVariables>(CreateFabricDocument);
};
export const UpdateFabricDocument = gql`
    mutation UpdateFabric($input: UpdateFabricInput!) {
  updateFabric(input: $input) {
    id
    name
    code
    composition
  }
}
    `;

export function useUpdateFabricMutation() {
  return Urql.useMutation<UpdateFabricMutation, UpdateFabricMutationVariables>(UpdateFabricDocument);
};
export const DeleteFabricDocument = gql`
    mutation DeleteFabric($id: Int!) {
  deleteFabric(id: $id) {
    id
  }
}
    `;

export function useDeleteFabricMutation() {
  return Urql.useMutation<DeleteFabricMutation, DeleteFabricMutationVariables>(DeleteFabricDocument);
};
export const MySizeGroupsDocument = gql`
    query MySizeGroups {
  mySizeGroups {
    id
    name
    category
    sizes
    description
    isActive
    createdAt
  }
}
    `;

export function useMySizeGroupsQuery(options?: Omit<Urql.UseQueryArgs<MySizeGroupsQueryVariables>, 'query'>) {
  return Urql.useQuery<MySizeGroupsQuery, MySizeGroupsQueryVariables>({ query: MySizeGroupsDocument, ...options });
};
export const CreateSizeGroupDocument = gql`
    mutation CreateSizeGroup($input: CreateSizeGroupInput!) {
  createSizeGroup(input: $input) {
    id
    name
    sizes
  }
}
    `;

export function useCreateSizeGroupMutation() {
  return Urql.useMutation<CreateSizeGroupMutation, CreateSizeGroupMutationVariables>(CreateSizeGroupDocument);
};
export const UpdateSizeGroupDocument = gql`
    mutation UpdateSizeGroup($input: UpdateSizeGroupInput!) {
  updateSizeGroup(input: $input) {
    id
    name
    sizes
  }
}
    `;

export function useUpdateSizeGroupMutation() {
  return Urql.useMutation<UpdateSizeGroupMutation, UpdateSizeGroupMutationVariables>(UpdateSizeGroupDocument);
};
export const DeleteSizeGroupDocument = gql`
    mutation DeleteSizeGroup($id: Int!) {
  deleteSizeGroup(id: $id) {
    id
  }
}
    `;

export function useDeleteSizeGroupMutation() {
  return Urql.useMutation<DeleteSizeGroupMutation, DeleteSizeGroupMutationVariables>(DeleteSizeGroupDocument);
};
export const MySeasonsDocument = gql`
    query MySeasons {
  mySeasons {
    id
    name
    fullName
    year
    type
    startDate
    endDate
    description
    isActive
    companyId
    createdAt
    updatedAt
  }
}
    `;

export function useMySeasonsQuery(options?: Omit<Urql.UseQueryArgs<MySeasonsQueryVariables>, 'query'>) {
  return Urql.useQuery<MySeasonsQuery, MySeasonsQueryVariables>({ query: MySeasonsDocument, ...options });
};
export const CreateSeasonDocument = gql`
    mutation CreateSeason($name: String!, $fullName: String!, $year: Int!, $type: String!, $startDate: DateTime, $endDate: DateTime, $description: String) {
  createSeason(
    name: $name
    fullName: $fullName
    year: $year
    type: $type
    startDate: $startDate
    endDate: $endDate
    description: $description
  ) {
    id
    name
    fullName
  }
}
    `;

export function useCreateSeasonMutation() {
  return Urql.useMutation<CreateSeasonMutation, CreateSeasonMutationVariables>(CreateSeasonDocument);
};
export const UpdateSeasonDocument = gql`
    mutation UpdateSeason($id: Int!, $name: String, $fullName: String, $year: Int, $type: String, $startDate: DateTime, $endDate: DateTime, $description: String, $isActive: Boolean) {
  updateSeason(
    id: $id
    name: $name
    fullName: $fullName
    year: $year
    type: $type
    startDate: $startDate
    endDate: $endDate
    description: $description
    isActive: $isActive
  ) {
    id
    name
    fullName
  }
}
    `;

export function useUpdateSeasonMutation() {
  return Urql.useMutation<UpdateSeasonMutation, UpdateSeasonMutationVariables>(UpdateSeasonDocument);
};
export const DeleteSeasonDocument = gql`
    mutation DeleteSeason($id: Int!) {
  deleteSeason(id: $id) {
    id
  }
}
    `;

export function useDeleteSeasonMutation() {
  return Urql.useMutation<DeleteSeasonMutation, DeleteSeasonMutationVariables>(DeleteSeasonDocument);
};
export const MyFitsDocument = gql`
    query MyFits {
  myFits {
    id
    name
    code
    category
    description
    isActive
    companyId
    createdAt
    updatedAt
  }
}
    `;

export function useMyFitsQuery(options?: Omit<Urql.UseQueryArgs<MyFitsQueryVariables>, 'query'>) {
  return Urql.useQuery<MyFitsQuery, MyFitsQueryVariables>({ query: MyFitsDocument, ...options });
};
export const CreateFitDocument = gql`
    mutation CreateFit($name: String!, $code: String, $category: String, $description: String) {
  createFit(
    name: $name
    code: $code
    category: $category
    description: $description
  ) {
    id
    name
    code
  }
}
    `;

export function useCreateFitMutation() {
  return Urql.useMutation<CreateFitMutation, CreateFitMutationVariables>(CreateFitDocument);
};
export const UpdateFitDocument = gql`
    mutation UpdateFit($id: Int!, $name: String, $code: String, $category: String, $description: String, $isActive: Boolean) {
  updateFit(
    id: $id
    name: $name
    code: $code
    category: $category
    description: $description
    isActive: $isActive
  ) {
    id
    name
    code
  }
}
    `;

export function useUpdateFitMutation() {
  return Urql.useMutation<UpdateFitMutation, UpdateFitMutationVariables>(UpdateFitDocument);
};
export const DeleteFitDocument = gql`
    mutation DeleteFit($id: Int!) {
  deleteFit(id: $id) {
    id
  }
}
    `;

export function useDeleteFitMutation() {
  return Urql.useMutation<DeleteFitMutation, DeleteFitMutationVariables>(DeleteFitDocument);
};
export const SendMessageDocument = gql`
    mutation SendMessage($input: CreateMessageInput!) {
  sendMessage(input: $input) {
    id
    content
    senderId
    receiver
    isRead
    type
    createdAt
    sender {
      id
      name
      firstName
      lastName
      email
    }
    company {
      id
      name
    }
  }
}
    `;

export function useSendMessageMutation() {
  return Urql.useMutation<SendMessageMutation, SendMessageMutationVariables>(SendMessageDocument);
};
export const MarkMessageAsReadDocument = gql`
    mutation MarkMessageAsRead($id: Int!) {
  markMessageAsRead(id: $id) {
    id
    isRead
  }
}
    `;

export function useMarkMessageAsReadMutation() {
  return Urql.useMutation<MarkMessageAsReadMutation, MarkMessageAsReadMutationVariables>(MarkMessageAsReadDocument);
};
export const DeleteMessageDocument = gql`
    mutation DeleteMessage($id: Int!) {
  deleteMessage(id: $id) {
    id
  }
}
    `;

export function useDeleteMessageMutation() {
  return Urql.useMutation<DeleteMessageMutation, DeleteMessageMutationVariables>(DeleteMessageDocument);
};
export const MyMessagesDocument = gql`
    query MyMessages($filter: MessageFilterInput) {
  myMessages(filter: $filter) {
    id
    content
    senderId
    receiver
    isRead
    type
    createdAt
    sender {
      id
      name
      firstName
      lastName
      email
      company {
        id
        name
      }
    }
    company {
      id
      name
    }
  }
}
    `;

export function useMyMessagesQuery(options?: Omit<Urql.UseQueryArgs<MyMessagesQueryVariables>, 'query'>) {
  return Urql.useQuery<MyMessagesQuery, MyMessagesQueryVariables>({ query: MyMessagesDocument, ...options });
};
export const UnreadMessageCountDocument = gql`
    query UnreadMessageCount {
  unreadMessageCount
}
    `;

export function useUnreadMessageCountQuery(options?: Omit<Urql.UseQueryArgs<UnreadMessageCountQueryVariables>, 'query'>) {
  return Urql.useQuery<UnreadMessageCountQuery, UnreadMessageCountQueryVariables>({ query: UnreadMessageCountDocument, ...options });
};
export const CompanyMessagesDocument = gql`
    query CompanyMessages($companyId: Int) {
  companyMessages(companyId: $companyId) {
    id
    content
    senderId
    receiver
    isRead
    type
    createdAt
    sender {
      id
      name
      firstName
      lastName
      email
    }
    company {
      id
      name
    }
  }
}
    `;

export function useCompanyMessagesQuery(options?: Omit<Urql.UseQueryArgs<CompanyMessagesQueryVariables>, 'query'>) {
  return Urql.useQuery<CompanyMessagesQuery, CompanyMessagesQueryVariables>({ query: CompanyMessagesDocument, ...options });
};
export const LoginDocument = gql`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
      name
      firstName
      lastName
      role
      companyId
      isActive
      createdAt
      updatedAt
    }
  }
}
    `;

export function useLoginMutation() {
  return Urql.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument);
};
export const SignupDocument = gql`
    mutation Signup($input: SignupInput!) {
  signup(input: $input) {
    token
    user {
      id
      email
      name
      firstName
      lastName
      role
      companyId
      isCompanyOwner
      isPendingApproval
      department
      jobTitle
      isActive
      createdAt
      updatedAt
      company {
        id
        name
        type
      }
    }
  }
}
    `;

export function useSignupMutation() {
  return Urql.useMutation<SignupMutation, SignupMutationVariables>(SignupDocument);
};
export const CreateUserDocument = gql`
    mutation CreateUser($email: String!, $name: String!, $password: String!, $role: Role!) {
  createUser(email: $email, name: $name, password: $password, role: $role) {
    id
    email
    name
    role
    isActive
    createdAt
    updatedAt
  }
}
    `;

export function useCreateUserMutation() {
  return Urql.useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument);
};
export const UpdateUserDocument = gql`
    mutation UpdateUser($input: UserUpdateInput!) {
  updateUser(input: $input) {
    id
    email
    name
    firstName
    lastName
    role
    isActive
    createdAt
    updatedAt
  }
}
    `;

export function useUpdateUserMutation() {
  return Urql.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument);
};
export const DeleteUserDocument = gql`
    mutation DeleteUser($id: Int!) {
  deleteUser(id: $id) {
    id
    email
    name
  }
}
    `;

export function useDeleteUserMutation() {
  return Urql.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument);
};
export const CreateCompanyDocument = gql`
    mutation CreateCompany($name: String!, $email: String!, $phone: String, $address: String, $website: String, $isActive: Boolean) {
  createCompany(
    name: $name
    email: $email
    phone: $phone
    address: $address
    website: $website
    isActive: $isActive
  ) {
    id
    name
    email
    phone
    address
    website
    isActive
    createdAt
    updatedAt
  }
}
    `;

export function useCreateCompanyMutation() {
  return Urql.useMutation<CreateCompanyMutation, CreateCompanyMutationVariables>(CreateCompanyDocument);
};
export const UpdateCompanyDocument = gql`
    mutation UpdateCompany($id: Int!, $name: String, $email: String, $phone: String, $address: String, $website: String, $description: String, $isActive: Boolean) {
  updateCompany(
    id: $id
    name: $name
    email: $email
    phone: $phone
    address: $address
    website: $website
    isActive: $isActive
  ) {
    id
    name
    email
    phone
    address
    website
    isActive
    createdAt
    updatedAt
  }
}
    `;

export function useUpdateCompanyMutation() {
  return Urql.useMutation<UpdateCompanyMutation, UpdateCompanyMutationVariables>(UpdateCompanyDocument);
};
export const DeleteCompanyDocument = gql`
    mutation DeleteCompany($id: Int!) {
  deleteCompany(id: $id) {
    id
    name
    email
  }
}
    `;

export function useDeleteCompanyMutation() {
  return Urql.useMutation<DeleteCompanyMutation, DeleteCompanyMutationVariables>(DeleteCompanyDocument);
};
export const CreateCategoryDocument = gql`
    mutation CreateCategory($name: String!, $description: String, $parentCategoryId: Int, $companyId: Int) {
  createCategory(
    name: $name
    description: $description
    parentCategoryId: $parentCategoryId
    companyId: $companyId
  ) {
    id
    name
    description
    collectionsCount
    author {
      id
      name
    }
    company {
      id
      name
    }
    parentCategory {
      id
      name
    }
    createdAt
    updatedAt
  }
}
    `;

export function useCreateCategoryMutation() {
  return Urql.useMutation<CreateCategoryMutation, CreateCategoryMutationVariables>(CreateCategoryDocument);
};
export const UpdateCategoryDocument = gql`
    mutation UpdateCategory($id: Int!, $name: String, $description: String, $parentCategoryId: Int, $companyId: Int) {
  updateCategory(
    id: $id
    name: $name
    description: $description
    parentCategoryId: $parentCategoryId
    companyId: $companyId
  ) {
    id
    name
    description
    collectionsCount
    author {
      id
      name
    }
    company {
      id
      name
    }
    parentCategory {
      id
      name
    }
    createdAt
    updatedAt
  }
}
    `;

export function useUpdateCategoryMutation() {
  return Urql.useMutation<UpdateCategoryMutation, UpdateCategoryMutationVariables>(UpdateCategoryDocument);
};
export const DeleteCategoryDocument = gql`
    mutation DeleteCategory($id: Int!) {
  deleteCategory(id: $id) {
    id
    name
  }
}
    `;

export function useDeleteCategoryMutation() {
  return Urql.useMutation<DeleteCategoryMutation, DeleteCategoryMutationVariables>(DeleteCategoryDocument);
};
export const CreateCollectionDocument = gql`
    mutation CreateCollection($input: CreateCollectionInput!) {
  createCollection(input: $input) {
    id
    name
    description
    price
    sku
    stock
    images
    isActive
    isFeatured
    slug
    createdAt
    updatedAt
    category {
      id
      name
    }
    company {
      id
      name
    }
    author {
      id
      name
    }
  }
}
    `;

export function useCreateCollectionMutation() {
  return Urql.useMutation<CreateCollectionMutation, CreateCollectionMutationVariables>(CreateCollectionDocument);
};
export const UpdateCollectionDocument = gql`
    mutation UpdateCollection($input: UpdateCollectionInput!) {
  updateCollection(input: $input) {
    id
    name
    description
    price
    sku
    stock
    images
    isActive
    isFeatured
    slug
    createdAt
    updatedAt
    category {
      id
      name
    }
    company {
      id
      name
    }
    author {
      id
      name
    }
  }
}
    `;

export function useUpdateCollectionMutation() {
  return Urql.useMutation<UpdateCollectionMutation, UpdateCollectionMutationVariables>(UpdateCollectionDocument);
};
export const DeleteCollectionDocument = gql`
    mutation DeleteCollection($id: Int!) {
  deleteCollection(id: $id) {
    id
    name
  }
}
    `;

export function useDeleteCollectionMutation() {
  return Urql.useMutation<DeleteCollectionMutation, DeleteCollectionMutationVariables>(DeleteCollectionDocument);
};
export const CreateSampleDocument = gql`
    mutation CreateSample($input: CreateSampleInput!) {
  createSample(input: $input) {
    id
    sampleNumber
    sampleType
    status
    customerNote
    createdAt
    collection {
      id
      name
    }
    manufacture {
      id
      name
    }
    aiAnalysis {
      id
      detectedProduct
      detectedColor
      detectedFabric
      qualityScore
      estimatedCostMin
      estimatedCostMax
      trendScore
      designStyle
    }
  }
}
    `;

export function useCreateSampleMutation() {
  return Urql.useMutation<CreateSampleMutation, CreateSampleMutationVariables>(CreateSampleDocument);
};
export const UpdateSampleDocument = gql`
    mutation UpdateSample($input: UpdateSampleInput!) {
  updateSample(input: $input) {
    id
    sampleNumber
    status
    customerNote
    manufacturerResponse
    productionDays
    estimatedProductionDate
    actualProductionDate
    shippingDate
    cargoTrackingNumber
    updatedAt
  }
}
    `;

export function useUpdateSampleMutation() {
  return Urql.useMutation<UpdateSampleMutation, UpdateSampleMutationVariables>(UpdateSampleDocument);
};
export const UpdateSampleStatusDocument = gql`
    mutation UpdateSampleStatus($input: UpdateSampleStatusInput!) {
  updateSampleStatus(input: $input) {
    id
    sampleNumber
    status
    productionDays
    estimatedProductionDate
    actualProductionDate
    updatedAt
  }
}
    `;

export function useUpdateSampleStatusMutation() {
  return Urql.useMutation<UpdateSampleStatusMutation, UpdateSampleStatusMutationVariables>(UpdateSampleStatusDocument);
};
export const DeleteSampleDocument = gql`
    mutation DeleteSample($id: Int!) {
  deleteSample(id: $id) {
    id
    sampleNumber
  }
}
    `;

export function useDeleteSampleMutation() {
  return Urql.useMutation<DeleteSampleMutation, DeleteSampleMutationVariables>(DeleteSampleDocument);
};
export const ApproveSampleDocument = gql`
    mutation ApproveSample($id: Int!, $approve: Boolean!, $manufacturerNote: String, $estimatedDays: Int) {
  approveSample(
    id: $id
    approve: $approve
    manufacturerNote: $manufacturerNote
    estimatedDays: $estimatedDays
  ) {
    id
    sampleNumber
    status
    manufacturerResponse
    productionDays
    estimatedProductionDate
    updatedAt
  }
}
    `;

export function useApproveSampleMutation() {
  return Urql.useMutation<ApproveSampleMutation, ApproveSampleMutationVariables>(ApproveSampleDocument);
};
export const HoldSampleDocument = gql`
    mutation HoldSample($id: Int!, $reason: String) {
  holdSample(id: $id, reason: $reason) {
    id
    sampleNumber
    status
    manufacturerResponse
    updatedAt
  }
}
    `;

export function useHoldSampleMutation() {
  return Urql.useMutation<HoldSampleMutation, HoldSampleMutationVariables>(HoldSampleDocument);
};
export const CancelSampleDocument = gql`
    mutation CancelSample($id: Int!, $reason: String) {
  cancelSample(id: $id, reason: $reason) {
    id
    sampleNumber
    status
    manufacturerResponse
    updatedAt
  }
}
    `;

export function useCancelSampleMutation() {
  return Urql.useMutation<CancelSampleMutation, CancelSampleMutationVariables>(CancelSampleDocument);
};
export const ResumeSampleDocument = gql`
    mutation ResumeSample($id: Int!, $note: String) {
  resumeSample(id: $id, note: $note) {
    id
    sampleNumber
    status
    updatedAt
  }
}
    `;

export function useResumeSampleMutation() {
  return Urql.useMutation<ResumeSampleMutation, ResumeSampleMutationVariables>(ResumeSampleDocument);
};
export const CreateOrderDocument = gql`
    mutation CreateOrder($collectionId: Int!, $quantity: Int!, $unitPrice: Float, $customerNote: String, $deliveryAddress: String, $estimatedDelivery: DateTime, $manufactureId: Int, $companyId: Int) {
  createOrder(
    collectionId: $collectionId
    quantity: $quantity
    unitPrice: $unitPrice
    customerNote: $customerNote
    deliveryAddress: $deliveryAddress
    estimatedDelivery: $estimatedDelivery
    manufactureId: $manufactureId
    companyId: $companyId
  ) {
    id
    orderNumber
    status
    quantity
    unitPrice
    totalPrice
    createdAt
    collection {
      id
      name
    }
    manufacture {
      id
      name
    }
  }
}
    `;

export function useCreateOrderMutation() {
  return Urql.useMutation<CreateOrderMutation, CreateOrderMutationVariables>(CreateOrderDocument);
};
export const UpdateOrderStatusDocument = gql`
    mutation UpdateOrderStatus($id: Int!, $status: OrderStatus!, $note: String, $estimatedDays: Int, $quotedPrice: Float) {
  updateOrderStatus(
    id: $id
    status: $status
    note: $note
    estimatedDays: $estimatedDays
    quotedPrice: $quotedPrice
  ) {
    id
    orderNumber
    status
    unitPrice
    totalPrice
    productionDays
    estimatedProductionDate
    updatedAt
  }
}
    `;

export function useUpdateOrderStatusMutation() {
  return Urql.useMutation<UpdateOrderStatusMutation, UpdateOrderStatusMutationVariables>(UpdateOrderStatusDocument);
};
export const UpdateOrderDocument = gql`
    mutation UpdateOrder($id: Int!, $status: OrderStatus, $manufacturerResponse: String, $productionDays: Int, $estimatedProductionDate: DateTime) {
  updateOrder(
    id: $id
    status: $status
    manufacturerResponse: $manufacturerResponse
    productionDays: $productionDays
    estimatedProductionDate: $estimatedProductionDate
  ) {
    id
    status
    manufacturerResponse
    productionDays
    estimatedProductionDate
  }
}
    `;

export function useUpdateOrderMutation() {
  return Urql.useMutation<UpdateOrderMutation, UpdateOrderMutationVariables>(UpdateOrderDocument);
};
export const UpdateCustomerOrderDocument = gql`
    mutation UpdateCustomerOrder($id: Int!, $quantity: Int, $unitPrice: Float, $customerNote: String, $deliveryAddress: String) {
  updateCustomerOrder(
    id: $id
    quantity: $quantity
    unitPrice: $unitPrice
    customerNote: $customerNote
    deliveryAddress: $deliveryAddress
  ) {
    id
    orderNumber
    status
    quantity
    unitPrice
    totalPrice
    customerNote
    deliveryAddress
    updatedAt
  }
}
    `;

export function useUpdateCustomerOrderMutation() {
  return Urql.useMutation<UpdateCustomerOrderMutation, UpdateCustomerOrderMutationVariables>(UpdateCustomerOrderDocument);
};
export const CancelOrderDocument = gql`
    mutation CancelOrder($id: Int!, $reason: String) {
  cancelOrder(id: $id, reason: $reason) {
    id
    orderNumber
    status
    updatedAt
  }
}
    `;

export function useCancelOrderMutation() {
  return Urql.useMutation<CancelOrderMutation, CancelOrderMutationVariables>(CancelOrderDocument);
};
export const DeleteOrderDocument = gql`
    mutation DeleteOrder($id: Int!) {
  deleteOrder(id: $id) {
    id
    orderNumber
  }
}
    `;

export function useDeleteOrderMutation() {
  return Urql.useMutation<DeleteOrderMutation, DeleteOrderMutationVariables>(DeleteOrderDocument);
};
export const MyNotificationsDocument = gql`
    query MyNotifications($limit: Int, $offset: Int, $unreadOnly: Boolean) {
  myNotifications(limit: $limit, offset: $offset, unreadOnly: $unreadOnly) {
    id
    type
    title
    message
    link
    isRead
    createdAt
    updatedAt
  }
}
    `;

export function useMyNotificationsQuery(options?: Omit<Urql.UseQueryArgs<MyNotificationsQueryVariables>, 'query'>) {
  return Urql.useQuery<MyNotificationsQuery, MyNotificationsQueryVariables>({ query: MyNotificationsDocument, ...options });
};
export const UnreadNotificationCountDocument = gql`
    query UnreadNotificationCount {
  unreadNotificationCount
}
    `;

export function useUnreadNotificationCountQuery(options?: Omit<Urql.UseQueryArgs<UnreadNotificationCountQueryVariables>, 'query'>) {
  return Urql.useQuery<UnreadNotificationCountQuery, UnreadNotificationCountQueryVariables>({ query: UnreadNotificationCountDocument, ...options });
};
export const MarkNotificationAsReadDocument = gql`
    mutation MarkNotificationAsRead($id: Int!) {
  markNotificationAsRead(id: $id) {
    id
    isRead
  }
}
    `;

export function useMarkNotificationAsReadMutation() {
  return Urql.useMutation<MarkNotificationAsReadMutation, MarkNotificationAsReadMutationVariables>(MarkNotificationAsReadDocument);
};
export const MarkAllNotificationsAsReadDocument = gql`
    mutation MarkAllNotificationsAsRead {
  markAllNotificationsAsRead
}
    `;

export function useMarkAllNotificationsAsReadMutation() {
  return Urql.useMutation<MarkAllNotificationsAsReadMutation, MarkAllNotificationsAsReadMutationVariables>(MarkAllNotificationsAsReadDocument);
};
export const DeleteNotificationDocument = gql`
    mutation DeleteNotification($id: Int!) {
  deleteNotification(id: $id) {
    id
  }
}
    `;

export function useDeleteNotificationMutation() {
  return Urql.useMutation<DeleteNotificationMutation, DeleteNotificationMutationVariables>(DeleteNotificationDocument);
};
export const UpdateProductionStageDocument = gql`
    mutation UpdateProductionStage($input: UpdateProductionStageInput!) {
  updateProductionStage(input: $input) {
    id
    currentStage
    overallStatus
    progress
    estimatedStartDate
    estimatedEndDate
    actualStartDate
    actualEndDate
    notes
    createdAt
    updatedAt
  }
}
    `;

export function useUpdateProductionStageMutation() {
  return Urql.useMutation<UpdateProductionStageMutation, UpdateProductionStageMutationVariables>(UpdateProductionStageDocument);
};
export const ProductionTrackingDocument = gql`
    query ProductionTracking($id: Int, $orderId: Int, $sampleId: Int) {
  productionTracking(id: $id, orderId: $orderId, sampleId: $sampleId) {
    id
    orderId
    sampleId
    currentStage
    overallStatus
    progress
    estimatedStartDate
    estimatedEndDate
    actualStartDate
    actualEndDate
    notes
    createdAt
    updatedAt
    companyId
    order {
      id
      orderNumber
      manufacture {
        id
      }
      company {
        id
      }
    }
    sample {
      id
      sampleNumber
      manufacture {
        id
      }
      company {
        id
      }
    }
    stageUpdates {
      id
      stage
      status
      actualStartDate
      actualEndDate
      estimatedDays
      notes
      photos
      isRevision
      extraDays
      createdAt
    }
    qualityControls {
      id
      checkDate
      result
      score
      notes
      photos
      fabricDefects
      sewingDefects
      measureDefects
      finishingDefects
      createdAt
      inspector {
        id
        firstName
        lastName
      }
    }
  }
}
    `;

export function useProductionTrackingQuery(options?: Omit<Urql.UseQueryArgs<ProductionTrackingQueryVariables>, 'query'>) {
  return Urql.useQuery<ProductionTrackingQuery, ProductionTrackingQueryVariables>({ query: ProductionTrackingDocument, ...options });
};
export const AddProductionStageUpdateDocument = gql`
    mutation AddProductionStageUpdate($productionId: Int!, $stage: ProductionStage!, $notes: String, $photos: String, $hasDelay: Boolean!, $delayReason: String, $extraDays: Int) {
  addProductionStageUpdate(
    productionId: $productionId
    stage: $stage
    notes: $notes
    photos: $photos
    hasDelay: $hasDelay
    delayReason: $delayReason
    extraDays: $extraDays
  ) {
    id
    productionId
    stage
    status
    notes
    photos
    isRevision
    extraDays
    createdAt
  }
}
    `;

export function useAddProductionStageUpdateMutation() {
  return Urql.useMutation<AddProductionStageUpdateMutation, AddProductionStageUpdateMutationVariables>(AddProductionStageUpdateDocument);
};
export const CompleteProductionStageDocument = gql`
    mutation CompleteProductionStage($productionId: Int!, $stage: ProductionStage!) {
  completeProductionStage(productionId: $productionId, stage: $stage) {
    id
    currentStage
    overallStatus
    progress
  }
}
    `;

export function useCompleteProductionStageMutation() {
  return Urql.useMutation<CompleteProductionStageMutation, CompleteProductionStageMutationVariables>(CompleteProductionStageDocument);
};
export const RevertProductionStageDocument = gql`
    mutation RevertProductionStage($productionId: Int!, $targetStage: ProductionStage!) {
  revertProductionStage(productionId: $productionId, targetStage: $targetStage) {
    id
    currentStage
    overallStatus
    progress
  }
}
    `;

export function useRevertProductionStageMutation() {
  return Urql.useMutation<RevertProductionStageMutation, RevertProductionStageMutationVariables>(RevertProductionStageDocument);
};
export const AskQuestionDocument = gql`
    mutation AskQuestion($input: CreateQuestionInput!) {
  askQuestion(input: $input) {
    id
    question
    answer
    isAnswered
    isPublic
    collectionId
    createdAt
    customer {
      id
      firstName
      lastName
      name
    }
    manufacture {
      id
      firstName
      lastName
      name
    }
  }
}
    `;

export function useAskQuestionMutation() {
  return Urql.useMutation<AskQuestionMutation, AskQuestionMutationVariables>(AskQuestionDocument);
};
export const AnswerQuestionDocument = gql`
    mutation AnswerQuestion($input: AnswerQuestionInput!) {
  answerQuestion(input: $input) {
    id
    question
    answer
    isAnswered
    createdAt
  }
}
    `;

export function useAnswerQuestionMutation() {
  return Urql.useMutation<AnswerQuestionMutation, AnswerQuestionMutationVariables>(AnswerQuestionDocument);
};
export const DeleteQuestionDocument = gql`
    mutation DeleteQuestion($id: Int!) {
  deleteQuestion(id: $id) {
    id
  }
}
    `;

export function useDeleteQuestionMutation() {
  return Urql.useMutation<DeleteQuestionMutation, DeleteQuestionMutationVariables>(DeleteQuestionDocument);
};
export const CollectionQuestionsDocument = gql`
    query CollectionQuestions($collectionId: Int, $includePrivate: Boolean) {
  collectionQuestions(
    collectionId: $collectionId
    includePrivate: $includePrivate
  ) {
    id
    question
    answer
    isAnswered
    isPublic
    createdAt
    customer {
      id
      firstName
      lastName
      name
    }
    manufacture {
      id
      firstName
      lastName
      name
    }
  }
}
    `;

export function useCollectionQuestionsQuery(options?: Omit<Urql.UseQueryArgs<CollectionQuestionsQueryVariables>, 'query'>) {
  return Urql.useQuery<CollectionQuestionsQuery, CollectionQuestionsQueryVariables>({ query: CollectionQuestionsDocument, ...options });
};
export const MyQuestionsDocument = gql`
    query MyQuestions {
  myQuestions {
    id
    question
    answer
    isAnswered
    isPublic
    collectionId
    createdAt
    collection {
      id
      name
    }
    customer {
      id
      firstName
      lastName
    }
  }
}
    `;

export function useMyQuestionsQuery(options?: Omit<Urql.UseQueryArgs<MyQuestionsQueryVariables>, 'query'>) {
  return Urql.useQuery<MyQuestionsQuery, MyQuestionsQueryVariables>({ query: MyQuestionsDocument, ...options });
};
export const UnansweredQuestionsDocument = gql`
    query UnansweredQuestions {
  unansweredQuestions {
    id
    question
    collectionId
    createdAt
    collection {
      id
      name
    }
    customer {
      id
      firstName
      lastName
      email
    }
  }
}
    `;

export function useUnansweredQuestionsQuery(options?: Omit<Urql.UseQueryArgs<UnansweredQuestionsQueryVariables>, 'query'>) {
  return Urql.useQuery<UnansweredQuestionsQuery, UnansweredQuestionsQueryVariables>({ query: UnansweredQuestionsDocument, ...options });
};
export const MeDocument = gql`
    query Me {
  me {
    id
    email
    name
    firstName
    lastName
    role
    companyId
    isCompanyOwner
    isPendingApproval
    department
    jobTitle
    permissions
    isActive
    createdAt
    updatedAt
    company {
      id
      name
      type
      email
    }
  }
}
    `;

export function useMeQuery(options?: Omit<Urql.UseQueryArgs<MeQueryVariables>, 'query'>) {
  return Urql.useQuery<MeQuery, MeQueryVariables>({ query: MeDocument, ...options });
};
export const AllUsersDocument = gql`
    query AllUsers($searchString: String, $role: Role, $skip: Int, $take: Int) {
  allUsers(searchString: $searchString, role: $role, skip: $skip, take: $take) {
    company {
      address
      createdAt
      description
      email
      id
      isActive
      name
      phone
      updatedAt
      website
    }
    companyId
    createdAt
    email
    firstName
    id
    username
    updatedAt
    role
    phone
    name
    lastName
    isActive
  }
}
    `;

export function useAllUsersQuery(options?: Omit<Urql.UseQueryArgs<AllUsersQueryVariables>, 'query'>) {
  return Urql.useQuery<AllUsersQuery, AllUsersQueryVariables>({ query: AllUsersDocument, ...options });
};
export const AllManufacturersDocument = gql`
    query AllManufacturers {
  allManufacturers {
    id
    name
    firstName
    lastName
    email
    phone
    companyId
    company {
      id
      name
    }
  }
}
    `;

export function useAllManufacturersQuery(options?: Omit<Urql.UseQueryArgs<AllManufacturersQueryVariables>, 'query'>) {
  return Urql.useQuery<AllManufacturersQuery, AllManufacturersQueryVariables>({ query: AllManufacturersDocument, ...options });
};
export const AllCompaniesDocument = gql`
    query AllCompanies {
  allCompanies {
    id
    name
    email
    phone
    address
    website
    isActive
    users {
      id
      name
      email
    }
    createdAt
    updatedAt
  }
}
    `;

export function useAllCompaniesQuery(options?: Omit<Urql.UseQueryArgs<AllCompaniesQueryVariables>, 'query'>) {
  return Urql.useQuery<AllCompaniesQuery, AllCompaniesQueryVariables>({ query: AllCompaniesDocument, ...options });
};
export const AllCategoriesDocument = gql`
    query AllCategories {
  allCategories {
    id
    name
    description
    collectionsCount
    author {
      id
      name
    }
    company {
      id
      name
    }
    parentCategory {
      id
      name
    }
    subCategories {
      id
      name
      collectionsCount
    }
    createdAt
    updatedAt
  }
}
    `;

export function useAllCategoriesQuery(options?: Omit<Urql.UseQueryArgs<AllCategoriesQueryVariables>, 'query'>) {
  return Urql.useQuery<AllCategoriesQuery, AllCategoriesQueryVariables>({ query: AllCategoriesDocument, ...options });
};
export const RootCategoriesDocument = gql`
    query RootCategories {
  rootCategories {
    id
    name
    description
    collectionsCount
    author {
      id
      name
    }
    company {
      id
      name
    }
    subCategories {
      id
      name
      description
      collectionsCount
      subCategories {
        id
        name
        collectionsCount
      }
    }
    createdAt
    updatedAt
  }
}
    `;

export function useRootCategoriesQuery(options?: Omit<Urql.UseQueryArgs<RootCategoriesQueryVariables>, 'query'>) {
  return Urql.useQuery<RootCategoriesQuery, RootCategoriesQueryVariables>({ query: RootCategoriesDocument, ...options });
};
export const CategoryTreeDocument = gql`
    query CategoryTree {
  categoryTree {
    id
    name
    description
    collectionsCount
    author {
      id
      name
    }
    company {
      id
      name
    }
    subCategories {
      id
      name
      description
      collectionsCount
      subCategories {
        id
        name
        collectionsCount
      }
    }
  }
}
    `;

export function useCategoryTreeQuery(options?: Omit<Urql.UseQueryArgs<CategoryTreeQueryVariables>, 'query'>) {
  return Urql.useQuery<CategoryTreeQuery, CategoryTreeQueryVariables>({ query: CategoryTreeDocument, ...options });
};
export const CompanyDocument = gql`
    query Company($companyId: Int) {
  company(id: $companyId) {
    address
    createdAt
    description
    email
    id
    isActive
    name
    phone
    updatedAt
    website
    users {
      id
      firstName
      email
      createdAt
      companyId
      isActive
      lastName
      name
      phone
      role
      updatedAt
      username
    }
  }
}
    `;

export function useCompanyQuery(options?: Omit<Urql.UseQueryArgs<CompanyQueryVariables>, 'query'>) {
  return Urql.useQuery<CompanyQuery, CompanyQueryVariables>({ query: CompanyDocument, ...options });
};
export const AllCollectionsDocument = gql`
    query AllCollections($categoryId: Int, $companyId: Int, $isActive: Boolean, $isFeatured: Boolean, $search: String, $limit: Int, $offset: Int) {
  collections(
    categoryId: $categoryId
    companyId: $companyId
    isActive: $isActive
    isFeatured: $isFeatured
    search: $search
    limit: $limit
    offset: $offset
  ) {
    id
    name
    description
    price
    sku
    stock
    images
    isActive
    isFeatured
    slug
    productionSchedule
    createdAt
    updatedAt
    modelCode
    season
    gender
    fit
    trend
    colors
    sizeRange
    measurementChart
    fabricComposition
    accessories
    techPack
    moq
    targetPrice
    targetLeadTime
    notes
    likesCount
    category {
      id
      name
    }
    company {
      id
      name
      address
      location
    }
    author {
      id
      name
      firstName
      lastName
    }
    certifications {
      id
      name
      category
      code
    }
    samplesCount
    ordersCount
  }
}
    `;

export function useAllCollectionsQuery(options?: Omit<Urql.UseQueryArgs<AllCollectionsQueryVariables>, 'query'>) {
  return Urql.useQuery<AllCollectionsQuery, AllCollectionsQueryVariables>({ query: AllCollectionsDocument, ...options });
};
export const CollectionByIdDocument = gql`
    query CollectionById($id: Int!) {
  collection(id: $id) {
    id
    name
    description
    price
    sku
    stock
    images
    isActive
    isFeatured
    slug
    productionSchedule
    createdAt
    updatedAt
    category {
      id
      name
      description
      company {
        id
        name
      }
    }
    company {
      id
      name
      email
      website
    }
    author {
      id
      name
      firstName
      lastName
      email
    }
    samplesCount
    ordersCount
  }
}
    `;

export function useCollectionByIdQuery(options: Omit<Urql.UseQueryArgs<CollectionByIdQueryVariables>, 'query'>) {
  return Urql.useQuery<CollectionByIdQuery, CollectionByIdQueryVariables>({ query: CollectionByIdDocument, ...options });
};
export const CollectionsByCategoryDocument = gql`
    query CollectionsByCategory($categoryId: Int!, $includeSubcategories: Boolean) {
  collectionsByCategory(
    categoryId: $categoryId
    includeSubcategories: $includeSubcategories
  ) {
    id
    name
    description
    price
    sku
    stock
    images
    isActive
    isFeatured
    slug
    productionSchedule
    createdAt
    category {
      id
      name
    }
    company {
      id
      name
    }
    author {
      id
      name
    }
    samplesCount
    ordersCount
  }
}
    `;

export function useCollectionsByCategoryQuery(options: Omit<Urql.UseQueryArgs<CollectionsByCategoryQueryVariables>, 'query'>) {
  return Urql.useQuery<CollectionsByCategoryQuery, CollectionsByCategoryQueryVariables>({ query: CollectionsByCategoryDocument, ...options });
};
export const MyCollectionsDocument = gql`
    query MyCollections {
  myCollections {
    id
    name
    description
    price
    sku
    stock
    images
    isActive
    isFeatured
    slug
    productionSchedule
    createdAt
    updatedAt
    category {
      id
      name
    }
    company {
      id
      name
    }
    author {
      id
      name
    }
    samplesCount
    ordersCount
  }
}
    `;

export function useMyCollectionsQuery(options?: Omit<Urql.UseQueryArgs<MyCollectionsQueryVariables>, 'query'>) {
  return Urql.useQuery<MyCollectionsQuery, MyCollectionsQueryVariables>({ query: MyCollectionsDocument, ...options });
};
export const FeaturedCollectionsDocument = gql`
    query FeaturedCollections($limit: Int) {
  featuredCollections(limit: $limit) {
    id
    name
    description
    price
    sku
    stock
    images
    isActive
    isFeatured
    slug
    productionSchedule
    createdAt
    category {
      id
      name
    }
    company {
      id
      name
    }
    author {
      id
      name
    }
    samplesCount
    ordersCount
  }
}
    `;

export function useFeaturedCollectionsQuery(options?: Omit<Urql.UseQueryArgs<FeaturedCollectionsQueryVariables>, 'query'>) {
  return Urql.useQuery<FeaturedCollectionsQuery, FeaturedCollectionsQueryVariables>({ query: FeaturedCollectionsDocument, ...options });
};
export const AllSamplesDocument = gql`
    query AllSamples($status: SampleStatus, $sampleType: SampleType, $customerId: Int, $manufactureId: Int, $companyId: Int, $search: String, $limit: Int, $offset: Int) {
  samples(
    status: $status
    sampleType: $sampleType
    customerId: $customerId
    manufactureId: $manufactureId
    companyId: $companyId
    search: $search
    limit: $limit
    offset: $offset
  ) {
    id
    sampleNumber
    sampleType
    status
    customerNote
    manufacturerResponse
    productionDays
    estimatedProductionDate
    actualProductionDate
    shippingDate
    cargoTrackingNumber
    deliveryAddress
    createdAt
    updatedAt
    collection {
      id
      name
      images
    }
    originalCollection {
      id
      name
    }
    customer {
      id
      name
      firstName
      lastName
      email
    }
    manufacture {
      id
      name
      firstName
      lastName
      email
    }
    company {
      id
      name
    }
  }
}
    `;

export function useAllSamplesQuery(options?: Omit<Urql.UseQueryArgs<AllSamplesQueryVariables>, 'query'>) {
  return Urql.useQuery<AllSamplesQuery, AllSamplesQueryVariables>({ query: AllSamplesDocument, ...options });
};
export const SampleByIdDocument = gql`
    query SampleById($id: Int!) {
  sample(id: $id) {
    id
    sampleNumber
    sampleType
    status
    customerNote
    manufacturerResponse
    customDesignImages
    revisionRequests
    originalCollectionId
    productionDays
    estimatedProductionDate
    actualProductionDate
    shippingDate
    cargoTrackingNumber
    deliveryAddress
    createdAt
    updatedAt
    collection {
      id
      name
      description
      price
      images
      category {
        id
        name
      }
    }
    originalCollection {
      id
      name
      images
    }
    customer {
      id
      name
      firstName
      lastName
      email
      phone
    }
    manufacture {
      id
      name
      firstName
      lastName
      email
      phone
    }
    company {
      id
      name
      email
      phone
    }
  }
}
    `;

export function useSampleByIdQuery(options: Omit<Urql.UseQueryArgs<SampleByIdQueryVariables>, 'query'>) {
  return Urql.useQuery<SampleByIdQuery, SampleByIdQueryVariables>({ query: SampleByIdDocument, ...options });
};
export const MySamplesDocument = gql`
    query MySamples($status: SampleStatus, $sampleType: SampleType) {
  mySamples(status: $status, sampleType: $sampleType) {
    id
    sampleNumber
    sampleType
    status
    customerNote
    manufacturerResponse
    productionDays
    estimatedProductionDate
    actualProductionDate
    createdAt
    updatedAt
    collection {
      id
      name
      images
      modelCode
    }
    originalCollection {
      id
      name
    }
    customer {
      id
      name
      firstName
      lastName
      email
    }
    manufacture {
      id
      name
      firstName
      lastName
      email
      company {
        id
        name
      }
    }
  }
}
    `;

export function useMySamplesQuery(options?: Omit<Urql.UseQueryArgs<MySamplesQueryVariables>, 'query'>) {
  return Urql.useQuery<MySamplesQuery, MySamplesQueryVariables>({ query: MySamplesDocument, ...options });
};
export const AssignedSamplesDocument = gql`
    query AssignedSamples($status: SampleStatus, $sampleType: SampleType) {
  assignedSamples(status: $status, sampleType: $sampleType) {
    id
    sampleNumber
    sampleType
    status
    customerNote
    productionDays
    estimatedProductionDate
    createdAt
    collection {
      id
      name
      images
    }
    customer {
      id
      name
      firstName
      lastName
      email
    }
  }
}
    `;

export function useAssignedSamplesQuery(options?: Omit<Urql.UseQueryArgs<AssignedSamplesQueryVariables>, 'query'>) {
  return Urql.useQuery<AssignedSamplesQuery, AssignedSamplesQueryVariables>({ query: AssignedSamplesDocument, ...options });
};
export const SampleProductionHistoryDocument = gql`
    query SampleProductionHistory($sampleId: Int!) {
  sampleProductionHistory(sampleId: $sampleId) {
    id
    status
    note
    estimatedDays
    actualDate
    createdAt
    updatedBy {
      id
      name
      firstName
      lastName
    }
  }
}
    `;

export function useSampleProductionHistoryQuery(options: Omit<Urql.UseQueryArgs<SampleProductionHistoryQueryVariables>, 'query'>) {
  return Urql.useQuery<SampleProductionHistoryQuery, SampleProductionHistoryQueryVariables>({ query: SampleProductionHistoryDocument, ...options });
};
export const AllOrdersDocument = gql`
    query AllOrders($status: OrderStatus, $customerId: Int, $manufactureId: Int, $companyId: Int, $search: String, $limit: Int, $offset: Int) {
  orders(
    status: $status
    customerId: $customerId
    manufactureId: $manufactureId
    companyId: $companyId
    search: $search
    limit: $limit
    offset: $offset
  ) {
    id
    orderNumber
    status
    quantity
    unitPrice
    totalPrice
    customerNote
    manufacturerResponse
    productionDays
    estimatedProductionDate
    actualProductionStart
    actualProductionEnd
    shippingDate
    cargoTrackingNumber
    createdAt
    updatedAt
    collection {
      id
      name
      modelCode
      images
    }
    customer {
      id
      name
      firstName
      lastName
      email
    }
    manufacture {
      id
      name
      firstName
      lastName
      email
      company {
        id
        name
      }
    }
    company {
      id
      name
    }
  }
}
    `;

export function useAllOrdersQuery(options?: Omit<Urql.UseQueryArgs<AllOrdersQueryVariables>, 'query'>) {
  return Urql.useQuery<AllOrdersQuery, AllOrdersQueryVariables>({ query: AllOrdersDocument, ...options });
};
export const OrderByIdDocument = gql`
    query OrderById($id: Int!) {
  order(id: $id) {
    id
    orderNumber
    status
    quantity
    unitPrice
    totalPrice
    customerNote
    manufacturerResponse
    specifications
    deliveryAddress
    cargoTrackingNumber
    productionDays
    estimatedProductionDate
    actualProductionStart
    actualProductionEnd
    shippingDate
    createdAt
    updatedAt
    collection {
      id
      name
      description
      price
      images
    }
    customer {
      id
      name
      firstName
      lastName
      email
      phone
    }
    manufacture {
      id
      name
      firstName
      lastName
      email
      phone
    }
    company {
      id
      name
    }
  }
}
    `;

export function useOrderByIdQuery(options: Omit<Urql.UseQueryArgs<OrderByIdQueryVariables>, 'query'>) {
  return Urql.useQuery<OrderByIdQuery, OrderByIdQueryVariables>({ query: OrderByIdDocument, ...options });
};
export const MyOrdersDocument = gql`
    query MyOrders($status: OrderStatus) {
  myOrders(status: $status) {
    id
    orderNumber
    status
    quantity
    unitPrice
    totalPrice
    productionDays
    estimatedProductionDate
    actualProductionStart
    customerNote
    manufacturerResponse
    createdAt
    updatedAt
    collection {
      id
      name
      modelCode
      images
    }
    customer {
      id
      name
      firstName
      lastName
      email
    }
    manufacture {
      id
      name
      firstName
      lastName
      email
      company {
        id
        name
      }
    }
  }
}
    `;

export function useMyOrdersQuery(options?: Omit<Urql.UseQueryArgs<MyOrdersQueryVariables>, 'query'>) {
  return Urql.useQuery<MyOrdersQuery, MyOrdersQueryVariables>({ query: MyOrdersDocument, ...options });
};
export const AssignedOrdersDocument = gql`
    query AssignedOrders($status: OrderStatus) {
  assignedOrders(status: $status) {
    id
    orderNumber
    status
    quantity
    unitPrice
    totalPrice
    productionDays
    estimatedProductionDate
    actualProductionStart
    customerNote
    manufacturerResponse
    createdAt
    collection {
      id
      name
      modelCode
      images
    }
    customer {
      id
      name
      firstName
      lastName
      email
    }
    manufacture {
      id
      name
      firstName
      lastName
      email
      company {
        id
        name
      }
    }
  }
}
    `;

export function useAssignedOrdersQuery(options?: Omit<Urql.UseQueryArgs<AssignedOrdersQueryVariables>, 'query'>) {
  return Urql.useQuery<AssignedOrdersQuery, AssignedOrdersQueryVariables>({ query: AssignedOrdersDocument, ...options });
};
export const PublicPlatformStatsDocument = gql`
    query PublicPlatformStats {
  publicPlatformStats {
    totalProducts
    activeManufacturers
    activeWorkshops
    totalCollections
    totalOrders
    collectionsByGender {
      men
      women
      unisex
    }
    collectionsByCategory {
      category
      count
      men
      women
      unisex
    }
    sustainability {
      carbonFootprintReduction
      recycledMaterialUsage
      certifiedOrganicProducts
      gotsChronumCertified
      waterSavedLiters
    }
    suppliersByCountry {
      country
      count
      companies {
        name
        city
      }
    }
    platformFeatures {
      title
      description
      icon
    }
    recentActivity {
      newCollectionsThisWeek
      completedOrdersThisMonth
      newManufacturersThisMonth
      activeProductionsNow
      latestCollections {
        name
        gender
        createdAt
      }
    }
    testimonials {
      name
      role
      rating
      comment
    }
    growthMetrics {
      monthlyGrowthRate
      totalTransactionVolume
      avgDeliveryDays
      customerSatisfactionRate
    }
  }
}
    `;

export function usePublicPlatformStatsQuery(options?: Omit<Urql.UseQueryArgs<PublicPlatformStatsQueryVariables>, 'query'>) {
  return Urql.useQuery<PublicPlatformStatsQuery, PublicPlatformStatsQueryVariables>({ query: PublicPlatformStatsDocument, ...options });
};
export const CreateReviewDocument = gql`
    mutation CreateReview($input: CreateReviewInput!) {
  createReview(input: $input) {
    id
    rating
    comment
    isApproved
    collectionId
    createdAt
    customer {
      id
      firstName
      lastName
      name
    }
  }
}
    `;

export function useCreateReviewMutation() {
  return Urql.useMutation<CreateReviewMutation, CreateReviewMutationVariables>(CreateReviewDocument);
};
export const ApproveReviewDocument = gql`
    mutation ApproveReview($input: ApproveReviewInput!) {
  approveReview(input: $input) {
    id
    isApproved
  }
}
    `;

export function useApproveReviewMutation() {
  return Urql.useMutation<ApproveReviewMutation, ApproveReviewMutationVariables>(ApproveReviewDocument);
};
export const DeleteReviewDocument = gql`
    mutation DeleteReview($id: Int!) {
  deleteReview(id: $id) {
    id
  }
}
    `;

export function useDeleteReviewMutation() {
  return Urql.useMutation<DeleteReviewMutation, DeleteReviewMutationVariables>(DeleteReviewDocument);
};
export const CollectionReviewsDocument = gql`
    query CollectionReviews($collectionId: Int, $approvedOnly: Boolean) {
  collectionReviews(collectionId: $collectionId, approvedOnly: $approvedOnly) {
    id
    rating
    comment
    isApproved
    createdAt
    customer {
      id
      firstName
      lastName
      name
      company {
        id
        name
      }
    }
  }
}
    `;

export function useCollectionReviewsQuery(options?: Omit<Urql.UseQueryArgs<CollectionReviewsQueryVariables>, 'query'>) {
  return Urql.useQuery<CollectionReviewsQuery, CollectionReviewsQueryVariables>({ query: CollectionReviewsDocument, ...options });
};
export const CollectionAverageRatingDocument = gql`
    query CollectionAverageRating($collectionId: Int) {
  collectionAverageRating(collectionId: $collectionId)
}
    `;

export function useCollectionAverageRatingQuery(options?: Omit<Urql.UseQueryArgs<CollectionAverageRatingQueryVariables>, 'query'>) {
  return Urql.useQuery<CollectionAverageRatingQuery, CollectionAverageRatingQueryVariables>({ query: CollectionAverageRatingDocument, ...options });
};
export const MyReviewsDocument = gql`
    query MyReviews {
  myReviews {
    id
    rating
    comment
    isApproved
    collectionId
    createdAt
    collection {
      id
      name
    }
  }
}
    `;

export function useMyReviewsQuery(options?: Omit<Urql.UseQueryArgs<MyReviewsQueryVariables>, 'query'>) {
  return Urql.useQuery<MyReviewsQuery, MyReviewsQueryVariables>({ query: MyReviewsDocument, ...options });
};
export const PendingReviewsDocument = gql`
    query PendingReviews {
  pendingReviews {
    id
    rating
    comment
    collectionId
    createdAt
    collection {
      id
      name
    }
    customer {
      id
      firstName
      lastName
      email
    }
  }
}
    `;

export function usePendingReviewsQuery(options?: Omit<Urql.UseQueryArgs<PendingReviewsQueryVariables>, 'query'>) {
  return Urql.useQuery<PendingReviewsQuery, PendingReviewsQueryVariables>({ query: PendingReviewsDocument, ...options });
};
export const WorkshopsDocument = gql`
    query Workshops {
  workshops {
    id
    name
    type
    capacity
    location
    isActive
    activeProductionCount
    totalProductionCount
    utilizationRate
    owner {
      id
      name
    }
  }
}
    `;

export function useWorkshopsQuery(options?: Omit<Urql.UseQueryArgs<WorkshopsQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkshopsQuery, WorkshopsQueryVariables>({ query: WorkshopsDocument, ...options });
};
export const WorkshopDocument = gql`
    query Workshop($id: Int!) {
  workshop(id: $id) {
    id
    name
    type
    capacity
    location
    isActive
    activeProductionCount
    totalProductionCount
    utilizationRate
    owner {
      id
      name
    }
    sewingProductions {
      id
      currentStage
    }
    packagingProductions {
      id
      currentStage
    }
  }
}
    `;

export function useWorkshopQuery(options: Omit<Urql.UseQueryArgs<WorkshopQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkshopQuery, WorkshopQueryVariables>({ query: WorkshopDocument, ...options });
};
export const MyWorkshopsDocument = gql`
    query MyWorkshops {
  myWorkshops {
    id
    name
    type
    capacity
    location
    isActive
    activeProductionCount
    totalProductionCount
    utilizationRate
  }
}
    `;

export function useMyWorkshopsQuery(options?: Omit<Urql.UseQueryArgs<MyWorkshopsQueryVariables>, 'query'>) {
  return Urql.useQuery<MyWorkshopsQuery, MyWorkshopsQueryVariables>({ query: MyWorkshopsDocument, ...options });
};
export const WorkshopStatsDocument = gql`
    query WorkshopStats {
  workshopStats {
    totalWorkshops
    totalProductions
    activeProductions
    completedProductions
    utilizationRate
  }
}
    `;

export function useWorkshopStatsQuery(options?: Omit<Urql.UseQueryArgs<WorkshopStatsQueryVariables>, 'query'>) {
  return Urql.useQuery<WorkshopStatsQuery, WorkshopStatsQueryVariables>({ query: WorkshopStatsDocument, ...options });
};
export const CreateWorkshopDocument = gql`
    mutation CreateWorkshop($input: CreateWorkshopInput!) {
  createWorkshop(input: $input) {
    id
    name
    type
    capacity
    location
    isActive
  }
}
    `;

export function useCreateWorkshopMutation() {
  return Urql.useMutation<CreateWorkshopMutation, CreateWorkshopMutationVariables>(CreateWorkshopDocument);
};
export const UpdateWorkshopDocument = gql`
    mutation UpdateWorkshop($input: UpdateWorkshopInput!) {
  updateWorkshop(input: $input) {
    id
    name
    type
    capacity
    location
    isActive
  }
}
    `;

export function useUpdateWorkshopMutation() {
  return Urql.useMutation<UpdateWorkshopMutation, UpdateWorkshopMutationVariables>(UpdateWorkshopDocument);
};
export const DeleteWorkshopDocument = gql`
    mutation DeleteWorkshop($id: Int!) {
  deleteWorkshop(id: $id) {
    id
    name
  }
}
    `;

export function useDeleteWorkshopMutation() {
  return Urql.useMutation<DeleteWorkshopMutation, DeleteWorkshopMutationVariables>(DeleteWorkshopDocument);
};
export const AssignWorkshopToProductionDocument = gql`
    mutation AssignWorkshopToProduction($productionId: Int!, $sewingWorkshopId: Int, $packagingWorkshopId: Int) {
  assignWorkshopToProduction(
    productionId: $productionId
    sewingWorkshopId: $sewingWorkshopId
    packagingWorkshopId: $packagingWorkshopId
  ) {
    id
    currentStage
    sewingWorkshopId
    packagingWorkshopId
  }
}
    `;

export function useAssignWorkshopToProductionMutation() {
  return Urql.useMutation<AssignWorkshopToProductionMutation, AssignWorkshopToProductionMutationVariables>(AssignWorkshopToProductionDocument);
};
export const GetAiSamplesDocument = gql`
    query GetAISamples($limit: Int) {
  samples(limit: $limit) {
    id
    sampleNumber
    name
    description
    status
    images
    aiGenerated
    aiPrompt
    aiSketchUrl
    createdAt
  }
}
    `;

export function useGetAiSamplesQuery(options?: Omit<Urql.UseQueryArgs<GetAiSamplesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetAiSamplesQuery, GetAiSamplesQueryVariables>({ query: GetAiSamplesDocument, ...options });
};
export const GenerateDesignFromTextDocument = gql`
    mutation GenerateDesignFromText($prompt: String!, $negativePrompt: String, $width: Int, $height: Int, $steps: Int, $cfgScale: Float, $collectionId: Int, $sampleName: String, $description: String, $workflowName: String) {
  generateDesignFromText(
    prompt: $prompt
    negativePrompt: $negativePrompt
    width: $width
    height: $height
    steps: $steps
    cfgScale: $cfgScale
    collectionId: $collectionId
    sampleName: $sampleName
    description: $description
    workflowName: $workflowName
  ) {
    id
    sampleNumber
    name
    description
    status
    images
    aiGenerated
    aiPrompt
    aiSketchUrl
    createdAt
  }
}
    `;

export function useGenerateDesignFromTextMutation() {
  return Urql.useMutation<GenerateDesignFromTextMutation, GenerateDesignFromTextMutationVariables>(GenerateDesignFromTextDocument);
};
export const AnalyzeProductWithOllamaDocument = gql`
    mutation AnalyzeProductWithOllama($imageUrl: String!, $userNotes: String) {
  analyzeProductWithOllama(imageUrl: $imageUrl, userNotes: $userNotes) {
    productType
    category
    colors
    material
    pattern
    style
    neckline
    sleeves
    fit
    details
    suggestedModels {
      variant
      prompt
    }
    designPrompt
    rawResponse
  }
}
    `;

export function useAnalyzeProductWithOllamaMutation() {
  return Urql.useMutation<AnalyzeProductWithOllamaMutation, AnalyzeProductWithOllamaMutationVariables>(AnalyzeProductWithOllamaDocument);
};