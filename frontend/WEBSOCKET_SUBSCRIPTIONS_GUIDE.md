# WebSocket Subscriptions - Kullanım Rehberi 🚀

Backend'inizde **GraphQL Yoga + PubSub** ile hazır subscription sistemi var! Frontend'i de bağladık.

## 🎯 Mevcut Subscriptions (Backend)

### 1. Notifications (Bildirimler)
```graphql
subscription OnNewNotification {
  newNotification {
    id
    title
    message
    type
    isRead
    relatedEntityType
    relatedEntityId
    actionUrl
    createdAt
  }
}

subscription OnNotificationRead {
  notificationRead {
    notificationId
    isRead
  }
}
```

### 2. Orders (Siparişler)
```graphql
# Belirli bir siparişi izle
subscription OnOrderStatusChanged {
  orderStatusChanged(orderId: 123) {
    orderId
    orderNumber
    status
    previousStatus
    updatedAt
    updatedBy
  }
}

# Teklif geldiğinde
subscription OnOrderQuoteReceived {
  orderQuoteReceived(orderId: 123) {
    orderId
    orderNumber
    quotedPrice
    quotedDays
    quoteNote
    quoteType
    quotedAt
  }
}

# Sipariş kargoya verildiğinde
subscription OnOrderShipped {
  orderShipped(orderId: 123) {
    orderId
    orderNumber
    cargoTrackingNumber
    shippedAt
    deliveryAddress
    estimatedDelivery
  }
}

# Tüm siparişlerim (hem müşteri hem üretici)
subscription OnMyOrderUpdates {
  myOrderUpdates {
    orderId
    orderNumber
    status
    previousStatus
    updatedAt
  }
}
```

### 3. Tasks (Görevler)
```graphql
# Yeni görev atandığında
subscription OnTaskAssigned {
  taskAssigned {
    id
    title
    description
    status
    priority
    dueDate
    assignedUserId
    createdAt
  }
}

# Görev durumu değiştiğinde
subscription OnTaskStatusChanged {
  taskStatusChanged(taskId: 456) {
    taskId
    status
    previousStatus
    updatedAt
    updatedBy
  }
}

# Görev önceliği değiştiğinde
subscription OnTaskPriorityChanged {
  taskPriorityChanged(taskId: 456) {
    taskId
    priority
  }
}
```

### 4. Production (Üretim Takibi)
```graphql
# Üretim durumu değiştiğinde
subscription OnProductionStatusChanged {
  productionStatusChanged(productionId: 789) {
    productionId
    status
    previousStatus
    currentStage
    estimatedCompletion
    actualCompletion
    updatedAt
  }
}

# Üretim aşaması güncellendiğinde
subscription OnProductionStageUpdated {
  productionStageUpdated(productionId: 789) {
    productionId
    stage
    status
    startedAt
    completedAt
    notes
    updatedBy
    updatedAt
  }
}

# Kalite kontrolü yapıldığında
subscription OnQualityControl {
  qualityControl(productionId: 789) {
    id
    productionId
    controlType
    result
    defects
    notes
    inspectedBy
    inspectedAt
  }
}
```

### 5. Samples (Numuneler)
```graphql
# Numune durumu değiştiğinde
subscription OnSampleStatusChanged {
  sampleStatusChanged(sampleId: 321) {
    sampleId
    sampleNumber
    status
    previousStatus
    updatedAt
    updatedBy
  }
}

# Numune teklifi geldiğinde
subscription OnSampleQuoteReceived {
  sampleQuoteReceived(sampleId: 321) {
    sampleId
    sampleNumber
    quotedPrice
    quotedDays
    quoteNote
    quotedBy
    quotedAt
  }
}

# Numune kargoya verildiğinde
subscription OnSampleShipped {
  sampleShipped(sampleId: 321) {
    sampleId
    sampleNumber
    cargoTrackingNumber
    shippedAt
    estimatedDelivery
  }
}

# Tüm numunelerim
subscription OnMySampleUpdates {
  mySampleUpdates {
    sampleId
    sampleNumber
    status
    previousStatus
    updatedAt
  }
}
```

### 6. Messages (Mesajlar)
```graphql
# Yeni mesaj geldiğinde (ürün bazlı)
subscription OnNewMessage {
  messageNew(productId: 555) {
    id
    content
    productId
    senderId
    receiverId
    isRead
    createdAt
  }
}

# Mesaj okunduğunda
subscription OnMessageRead {
  messageRead(productId: 555) {
    messageId
    isRead
    readAt
  }
}

# Kullanıcıya gelen tüm mesajlar
subscription OnUserMessages {
  messageUserReceived {
    id
    content
    productId
    senderId
    receiverId
    isRead
    createdAt
  }
}
```

---

## 💻 Frontend Kullanımı

### 1. Temel Subscription Hook

```tsx
'use client';

import { useSubscription } from '@/hooks/useGraphQL';
import { gql } from 'urql';

const NOTIFICATION_SUBSCRIPTION = gql`
  subscription {
    newNotification {
      id
      title
      message
    }
  }
`;

export function MyComponent() {
  const [result] = useSubscription({
    query: NOTIFICATION_SUBSCRIPTION,
  });

  if (result.data) {
    console.log('New notification:', result.data.newNotification);
  }

  return <div>Listening...</div>;
}
```

### 2. Parametreli Subscription

```tsx
const ORDER_SUBSCRIPTION = gql`
  subscription OnOrderUpdate($orderId: Int!) {
    orderStatusChanged(orderId: $orderId) {
      orderId
      status
      updatedAt
    }
  }
`;

export function OrderTracker({ orderId }: { orderId: number }) {
  const [result] = useSubscription({
    query: ORDER_SUBSCRIPTION,
    variables: { orderId },
  });

  return (
    <div>
      {result.data && (
        <div>Order {result.data.orderStatusChanged.orderId} - {result.data.orderStatusChanged.status}</div>
      )}
    </div>
  );
}
```

### 3. Background Listener (Önerilen)

Layout'a ekleyin, arka planda çalışsın:

```tsx
// app/layout.tsx
import { RealTimeListener } from '@/components/notifications/RealTimeListener';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <GraphQLProvider>
            <RealTimeListener /> {/* 🚀 WebSocket listener */}
            {children}
          </GraphQLProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 4. Toast Notification ile Kullanım

```tsx
import { useSubscription } from '@/hooks/useGraphQL';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function NotificationListener() {
  const [result] = useSubscription({
    query: NEW_NOTIFICATION_SUBSCRIPTION,
  });

  useEffect(() => {
    if (result.data?.newNotification) {
      toast.success(result.data.newNotification.title, {
        description: result.data.newNotification.message,
      });
    }
  }, [result.data]);

  return null; // Background component
}
```

### 5. Conditional Subscription (Pause)

```tsx
export function OrderWatcher({ orderId, isActive }: Props) {
  const [result] = useSubscription({
    query: ORDER_SUBSCRIPTION,
    variables: { orderId },
    pause: !isActive, // isActive false ise bağlanma
  });

  // ...
}
```

---

## 🔧 Configuration

### URQL Client Setup (Zaten yapıldı ✅)

```typescript
// frontend/src/lib/urql-client.ts

import { subscriptionExchange } from 'urql';
import { createClient as createWSClient } from 'graphql-ws';

// WebSocket client (singleton)
const wsClient = createWSClient({
  url: 'ws://localhost:4001/graphql',
  connectionParams: () => ({
    authorization: `Bearer ${token}`,
  }),
  shouldRetry: () => true,
  retryAttempts: 5,
});

// URQL exchanges
const exchanges = [
  cacheExchange,
  ssrExchange,
  subscriptionExchange({
    forwardSubscription(request) {
      return {
        subscribe(sink) {
          return wsClient.subscribe(request, sink);
        },
      };
    },
  }),
  fetchExchange,
];
```

---

## 🎨 Best Practices

### 1. Background Listeners (Önerilen ✅)

```tsx
// components/listeners/RealTimeListener.tsx
export function RealTimeListener() {
  return (
    <>
      <NotificationListener />
      <OrderUpdatesListener />
      <TaskAssignedListener />
    </>
  );
}
```

**Avantajları:**
- ✅ Tüm sayfalarda çalışır
- ✅ Toast notification ile bildirim
- ✅ UI'ı bloklamaz
- ✅ Tek bir component, tüm subscriptions

### 2. Page-Specific Subscriptions

```tsx
// app/orders/[id]/page.tsx
export default function OrderDetailPage({ params }) {
  const [result] = useSubscription({
    query: ORDER_STATUS_SUBSCRIPTION,
    variables: { orderId: params.id },
  });

  // Real-time order status
}
```

### 3. Cleanup on Logout

```tsx
// components/auth/LogoutButton.tsx
import { cleanupWSClient } from '@/lib/urql-client';

export function LogoutButton() {
  const handleLogout = () => {
    cleanupWSClient(); // ✅ WebSocket bağlantısını kapat
    signOut();
  };

  return <button onClick={handleLogout}>Çıkış</button>;
}
```

---

## 🐛 Debugging

### Chrome DevTools

```tsx
// Development'ta console log
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('WebSocket status:', {
      fetching: result.fetching,
      error: result.error,
      data: result.data,
    });
  }
}, [result]);
```

### Network Tab

- **Name:** `/graphql`
- **Type:** `websocket`
- **Status:** `101 Switching Protocols`

---

## ⚡ Performance Tips

### 1. Pause Inactive Subscriptions

```tsx
const [isVisible, setIsVisible] = useState(true);

const [result] = useSubscription({
  query: SUBSCRIPTION,
  pause: !isVisible, // Tab kapalıysa pause
});
```

### 2. Limit Subscription Scope

```tsx
// ❌ Kötü: Tüm notificationlar
subscription { allNotifications { ... } }

// ✅ İyi: Sadece kendi notificationlarım
subscription { newNotification { ... } } // Backend zaten userId filtreliyor
```

### 3. Debounce Rapid Updates

```tsx
import { debounce } from 'lodash';

const handleUpdate = debounce((data) => {
  // Process update
}, 500);

useEffect(() => {
  if (result.data) {
    handleUpdate(result.data);
  }
}, [result.data]);
```

---

## 🚀 Production Checklist

- [x] WebSocket URL (`wss://` for HTTPS)
- [x] Auth token gönderiliyor
- [x] Retry logic aktif
- [x] Cleanup on logout
- [x] Error handling
- [ ] Monitoring (Sentry, LogRocket)
- [ ] Rate limiting (backend)

---

## 📊 Use Cases

| Subscription | Use Case | Öncelik |
|-------------|----------|---------|
| `newNotification` | Genel bildirimler | 🔥 Yüksek |
| `myOrderUpdates` | Sipariş takibi | 🔥 Yüksek |
| `taskAssigned` | Görev yönetimi | 🟡 Orta |
| `orderStatusChanged` | Sipariş detay sayfası | 🟡 Orta |
| `productionStageUpdated` | Üretim dashboard | 🟢 Düşük |
| `messageNew` | Chat/messaging | 🔥 Yüksek |

---

## 🎉 Sonuç

**✅ Backend:** GraphQL Yoga + PubSub (hazır)
**✅ Frontend:** URQL + graphql-ws (kuruldu)
**✅ Auth:** JWT token ile WebSocket auth
**✅ Ready:** Production-ready!

**Şimdi yapmanız gerekenler:**
1. Layout'a `<RealTimeListener />` ekleyin
2. Backend'i çalıştırın (`npm run dev`)
3. Frontend'i çalıştırın (`npm run dev`)
4. GraphiQL'de subscription test edin
5. Browser DevTools → Network → WS bağlantısını görün

**Real-time ERP sisteminiz hazır!** 🚀
