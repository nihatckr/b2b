import "./Category";
import "./Collection";
import "./CollectionQuote";
import "./Company";
import "./File";
import "./LibraryItem";
import "./Message";
import "./Notification";
import "./Order";
import "./OrderChangeLog";
import "./OrderNegotiation";
import "./OrderProduction";
import "./OrderReview";
import "./OrderSizeBreakdown";
import "./Payment";
import "./ProductionStageUpdate";
import "./ProductionTracking";
import "./Question";
import "./Sample";
import "./SampleProduction";
import "./SampleSizeRequest";
import "./User";

// Import and register queries
import "../queries/categoryQuery";
import "../queries/collectionQuery";
import "../queries/companyQuery";
import "../queries/libraryQuery"; // Unified library system
import "../queries/messageQuery";
import "../queries/notificationQuery";
import "../queries/orderQuery";
import "../queries/questionQuery";
import "../queries/sampleQuery";
import "../queries/userQuery";

// ========================================
// ROOT MUTATION TYPE (Boş başlatıyoruz - mutations dosyalarında tanımlanıyor)
// ========================================

// Import and register mutations
import "../mutations/categoryMutation";
import "../mutations/collectionMutation";
import "../mutations/companyMutation";
import "../mutations/customerRFQMutation"; // Simple customer RFQ system
import "../mutations/libraryMutation"; // Unified library system
import "../mutations/messageMutation";
import "../mutations/notificationMutation";
import "../mutations/orderMutation";
import "../mutations/questionMutation";
import "../mutations/sampleMutation";
import "../mutations/userMutation";
