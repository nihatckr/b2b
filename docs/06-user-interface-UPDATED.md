# 🎨 User Interface Rehberi - Modern Design (Ekim 2025)

## 🚀 Tasarım Felsefesi

### Modern Web App Standartları

- **Modular Components**: React.js component-based architecture
- **GraphQL Integration**: Real-time data binding
- **Responsive First**: Mobile-first responsive design
- **Performance Optimized**: Sub-3 second load times
- **Accessibility**: WCAG 2.1 AA compliance
- **Dark Mode Support**: User preference based themes

### Design System

- **Framework**: React.js + TypeScript + Tailwind CSS
- **Component Library**: Headless UI / Radix UI
- **Icons**: Lucide React / Heroicons
- **Animation**: Framer Motion
- **Data Visualization**: Recharts / D3.js

---

## 1. 🎨 Color Palette & Typography

### Color System

```css
/* Primary Colors */
--primary-50: #eff6ff;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Semantic Colors */
--success: #10b981; /* Production completed */
--warning: #f59e0b; /* Delays, revisions */
--error: #ef4444; /* Quality failures */
--info: #06b6d4; /* Messages, notifications */

/* Status Colors */
--status-planning: #8b5cf6; /* PLANNING stage */
--status-fabric: #06b6d4; /* FABRIC stage */
--status-cutting: #f59e0b; /* CUTTING stage */
--status-sewing: #10b981; /* SEWING stage */
--status-quality: #ef4444; /* QUALITY stage */
--status-packaging: #6366f1; /* PACKAGING stage */
--status-shipping: #84cc16; /* SHIPPING stage */

/* Background */
--background: #ffffff;
--background-secondary: #f8fafc;
--background-tertiary: #f1f5f9;
```

### Typography Scale

```css
/* Font Family */
font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem; /* Labels, captions */
--text-sm: 0.875rem; /* Body text small */
--text-base: 1rem; /* Body text */
--text-lg: 1.125rem; /* Subheadings */
--text-xl: 1.25rem; /* Page titles */
--text-2xl: 1.5rem; /* Section headers */
--text-3xl: 1.875rem; /* Main headings */
```

---

## 2. 📱 Layout Architecture

### App Shell Structure

```tsx
<AppShell>
  <Header>
    <Logo />
    <Navigation role={userRole} />
    <UserMenu />
    <NotificationCenter />
  </Header>

  <Sidebar collapsed={sidebarState}>
    <MainNavigation />
    <QuickActions />
    <StatusSummary />
  </Sidebar>

  <MainContent>
    <PageHeader />
    <Breadcrumbs />
    <PageContent />
  </MainContent>

  <FloatingElements>
    <MessageCenter />
    <QuickActions />
  </FloatingElements>
</AppShell>
```

### Responsive Breakpoints

```css
/* Mobile First Approach */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet portrait */
lg: 1024px  /* Tablet landscape */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large desktop */
```

---

## 3. 🏭 Manufacturer Dashboard

### Dashboard Layout

```tsx
<ManufacturerDashboard>
  {/* KPI Cards */}
  <StatsGrid>
    <StatCard icon="Users" title="Aktif Müşteri" value="24" trend="+12%" />
    <StatCard icon="Package" title="Aktif Üretim" value="18" trend="+5%" />
    <StatCard icon="CheckCircle" title="Tamamlanan" value="156" trend="+23%" />
    <StatCard icon="AlertCircle" title="Geciken" value="3" trend="-2%" />
  </StatsGrid>

  {/* Production Pipeline */}
  <ProductionPipeline>
    <StageColumn stage="PLANNING" count={5} />
    <StageColumn stage="FABRIC" count={3} />
    <StageColumn stage="CUTTING" count={4} />
    <StageColumn stage="SEWING" count={8} />
    <StageColumn stage="QUALITY" count={2} />
    <StageColumn stage="PACKAGING" count={1} />
    <StageColumn stage="SHIPPING" count={2} />
  </ProductionPipeline>

  {/* Recent Activities */}
  <ActivityFeed />

  {/* Quality Reports */}
  <QualityMetrics />
</ManufacturerDashboard>
```

### Production Tracking Interface

```tsx
<ProductionTracker productionId={id}>
  {/* Progress Timeline */}
  <Timeline stages={productionStages}>
    {stages.map((stage) => (
      <TimelineItem
        stage={stage.name}
        status={stage.status}
        startDate={stage.actualStartDate}
        endDate={stage.actualEndDate}
        isActive={stage.status === "IN_PROGRESS"}
        photos={stage.photos}
        notes={stage.notes}
      />
    ))}
  </Timeline>

  {/* Stage Update Form */}
  <StageUpdateForm currentStage={currentStage} onUpdate={handleStageUpdate}>
    <StatusSelector />
    <DatePickers />
    <PhotoUpload />
    <NotesInput />
    <RevisionToggle />
  </StageUpdateForm>

  {/* Workshop Assignment */}
  <WorkshopAssignment
    stage={currentStage}
    availableWorkshops={workshops}
    onAssign={handleWorkshopAssign}
  />
</ProductionTracker>
```

### Quality Control Interface

```tsx
<QualityControlPanel>
  <QualityForm onSubmit={handleQualitySubmit}>
    <ScoreSlider min={1} max={100} />
    <DefectCategories>
      <Checkbox name="fabricDefects" label="Kumaş Hataları" />
      <Checkbox name="sewingDefects" label="Dikiş Hataları" />
      <Checkbox name="measureDefects" label="Ölçü Hataları" />
      <Checkbox name="finishingDefects" label="Finishing Hataları" />
    </DefectCategories>
    <PhotoUpload multiple accept="image/*" />
    <NotesTextArea placeholder="Kalite kontrol notları..." />
    <ResultSelector options={qualityResults} />
  </QualityForm>

  <QualityHistory productionId={productionId} />
</QualityControlPanel>
```

---

## 4. 🛒 Customer Interface

### Customer Dashboard

```tsx
<CustomerDashboard>
  {/* Order Status Overview */}
  <OrderStatusGrid>
    <StatusCard status="PENDING" count={2} color="yellow" />
    <StatusCard status="IN_PRODUCTION" count={5} color="blue" />
    <StatusCard status="SHIPPED" count={8} color="green" />
    <StatusCard status="DELIVERED" count={23} color="gray" />
  </OrderStatusGrid>

  {/* Active Production Timeline */}
  <ActiveProductions>
    {activeOrders.map((order) => (
      <ProductionCard
        order={order}
        currentStage={order.productionTracking.currentStage}
        progress={calculateProgress(order.productionTracking)}
        estimatedCompletion={order.estimatedDelivery}
      />
    ))}
  </ActiveProductions>

  {/* Recent Messages */}
  <MessagePreview />

  {/* Sample Requests */}
  <SampleRequests />
</CustomerDashboard>
```

### Product Catalog Interface

```tsx
<ProductCatalog>
  <CatalogFilters>
    <CategoryFilter categories={categories} />
    <ManufacturerFilter manufacturers={manufacturers} />
    <PriceRangeFilter />
    <SeasonFilter />
    <SearchInput placeholder="Ürün ara..." />
  </CatalogFilters>

  <ProductGrid>
    {collections.map((collection) => (
      <ProductCard
        key={collection.id}
        collection={collection}
        onSampleRequest={() => openSampleModal(collection)}
        onAddToOrder={() => addToOrder(collection)}
      >
        <ImageGallery images={collection.images} />
        <ProductInfo>
          <ProductName>{collection.name}</ProductName>
          <ManufacturerInfo manufacturer={collection.manufacturer} />
          <PriceRange>{collection.priceRange}</PriceRange>
          <SeasonBadge season={collection.season} year={collection.year} />
        </ProductInfo>
        <ActionButtons>
          <Button variant="outline">Numune Talep Et</Button>
          <Button variant="primary">Siparişe Ekle</Button>
        </ActionButtons>
      </ProductCard>
    ))}
  </ProductGrid>
</ProductCatalog>
```

### Order Tracking Interface

```tsx
<OrderTracker orderId={orderId}>
  <OrderHeader>
    <OrderNumber>{order.orderNumber}</OrderNumber>
    <OrderStatus status={order.status} />
    <EstimatedDelivery date={order.estimatedDelivery} />
  </OrderHeader>

  <ProductionTimeline>
    <ProgressBar
      stages={productionStages}
      currentStage={order.productionTracking.currentStage}
    />
    <StageDetails>
      {order.productionTracking.stageUpdates.map((update) => (
        <StageUpdate
          stage={update.stage}
          status={update.status}
          startDate={update.actualStartDate}
          endDate={update.actualEndDate}
          notes={update.notes}
          photos={update.photos}
          isRevision={update.isRevision}
        />
      ))}
    </StageDetails>
  </ProductionTimeline>

  <QualityReports>
    {order.productionTracking.qualityControls.map((qc) => (
      <QualityReport
        result={qc.result}
        score={qc.score}
        checkDate={qc.checkDate}
        defects={getDefects(qc)}
        photos={qc.photos}
        notes={qc.notes}
      />
    ))}
  </QualityReports>
</OrderTracker>
```

---

## 5. 💬 Messaging Interface

### Message Center

```tsx
<MessageCenter>
  <ConversationList>
    <ConversationSearch />
    {conversations.map((conv) => (
      <ConversationItem
        key={conv.id}
        conversation={conv}
        unreadCount={conv.unreadCount}
        lastMessage={conv.lastMessage}
        context={conv.context} // sample/order context
        onClick={() => selectConversation(conv)}
      />
    ))}
  </ConversationList>

  <MessageThread conversationId={selectedConversation}>
    <ThreadHeader>
      <ContactInfo />
      <ContextInfo /> {/* Sample/Order details */}
    </ThreadHeader>

    <MessageList>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderId === currentUser.id}
          type={message.type}
          attachment={message.attachmentUrl}
          timestamp={message.createdAt}
          isRead={message.isRead}
        />
      ))}
    </MessageList>

    <MessageInput>
      <TextInput placeholder="Mesaj yazın..." />
      <AttachmentButton />
      <SendButton />
    </MessageInput>
  </MessageThread>
</MessageCenter>
```

### Context-Based Messaging

```tsx
<ContextualMessaging>
  {/* Sample Context */}
  <SampleMessageThread sampleId={sampleId}>
    <SampleInfo sample={sample} />
    <ProductionUpdates updates={sample.productionTracking} />
    <MessageThread context="sample" contextId={sampleId} />
  </SampleMessageThread>

  {/* Order Context */}
  <OrderMessageThread orderId={orderId}>
    <OrderInfo order={order} />
    <ProductionStatus status={order.productionTracking} />
    <MessageThread context="order" contextId={orderId} />
  </OrderMessageThread>
</ContextualMessaging>
```

---

## 6. 📊 Data Visualization Components

### Production Analytics

```tsx
<ProductionAnalytics>
  <MetricsGrid>
    <MetricCard
      title="Ortalama Üretim Süresi"
      value="18 gün"
      trend="-2 gün"
      trendType="positive"
    />
    <MetricCard
      title="Kalite Skoru"
      value="94/100"
      trend="+3"
      trendType="positive"
    />
    <MetricCard
      title="Zamanında Teslimat"
      value="87%"
      trend="+5%"
      trendType="positive"
    />
  </MetricsGrid>

  <Charts>
    <ProductionTrendChart data={productionTrends} />
    <QualityDistributionChart data={qualityScores} />
    <StagePerformanceChart data={stageMetrics} />
  </Charts>
</ProductionAnalytics>
```

### Status Indicators

```tsx
<StatusIndicators>
  {/* Production Status */}
  <ProductionStatusBadge status="IN_PROGRESS" />
  <ProductionStatusBadge status="WAITING" />
  <ProductionStatusBadge status="BLOCKED" />
  <ProductionStatusBadge status="COMPLETED" />

  {/* Quality Results */}
  <QualityResultBadge result="PASSED" />
  <QualityResultBadge result="FAILED" />
  <QualityResultBadge result="CONDITIONAL_PASS" />

  {/* Stage Status */}
  <StageStatusIndicator status="NOT_STARTED" />
  <StageStatusIndicator status="IN_PROGRESS" />
  <StageStatusIndicator status="COMPLETED" />
  <StageStatusIndicator status="REQUIRES_REVISION" />
</StatusIndicators>
```

---

## 7. 📱 Mobile Optimization

### Mobile Navigation

```tsx
<MobileNavigation>
  <BottomNavigation>
    <NavItem icon="Home" label="Ana Sayfa" active />
    <NavItem icon="Package" label="Üretim" />
    <NavItem icon="MessageCircle" label="Mesajlar" badge={unreadCount} />
    <NavItem icon="User" label="Profil" />
  </BottomNavigation>

  <MobileHeader>
    <MenuToggle />
    <PageTitle />
    <NotificationBell />
  </MobileHeader>

  <SwipeableDrawer>
    <UserProfile />
    <MainNavigation />
    <QuickActions />
  </SwipeableDrawer>
</MobileNavigation>
```

### Touch Optimizations

```css
/* Touch Targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Swipe Gestures */
.swipeable {
  touch-action: pan-x;
}

/* Scroll Performance */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
```

---

## 8. 🔔 Notification System

### In-App Notifications

```tsx
<NotificationCenter>
  <NotificationBell badge={unreadNotifications.length} />

  <NotificationDropdown>
    <NotificationList>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          timestamp={notification.createdAt}
          isRead={notification.isRead}
          actions={notification.actions}
        />
      ))}
    </NotificationList>
  </NotificationDropdown>
</NotificationCenter>
```

### Toast Notifications

```tsx
<ToastProvider>
  <Toast variant="success" title="Başarılı" message="Aşama güncellendi" />
  <Toast variant="error" title="Hata" message="İşlem başarısız" />
  <Toast variant="warning" title="Uyarı" message="Gecikme riski" />
  <Toast variant="info" title="Bilgi" message="Yeni mesaj" />
</ToastProvider>
```

---

## 9. ⚡ Performance & UX

### Loading States

```tsx
<LoadingStates>
  {/* Skeleton Loading */}
  <SkeletonLoader>
    <SkeletonCard />
    <SkeletonList />
    <SkeletonChart />
  </SkeletonLoader>

  {/* Progress Indicators */}
  <ProgressBar value={uploadProgress} />
  <Spinner size="sm" />
  <LoadingOverlay />
</LoadingStates>
```

### Error Handling

```tsx
<ErrorBoundary>
  <ErrorPage
    title="Bir hata oluştu"
    message="Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin"
    actions={[
      { label: "Yenile", onClick: () => window.location.reload() },
      { label: "Ana Sayfa", onClick: () => navigate("/") },
    ]}
  />
</ErrorBoundary>
```

---

## 10. 🎯 Implementation Roadmap

### Phase 1: Core Components (2 hafta)

- [ ] Design System Setup
- [ ] Authentication UI
- [ ] Basic Dashboard Layout
- [ ] Navigation Components

### Phase 2: Feature Components (4 hafta)

- [ ] Production Tracking UI
- [ ] Messaging Interface
- [ ] Quality Control Forms
- [ ] Order Management UI

### Phase 3: Advanced Features (4 hafta)

- [ ] Real-time Updates
- [ ] Mobile Optimization
- [ ] Advanced Analytics
- [ ] Performance Optimization

### Phase 4: Polish & Testing (2 hafta)

- [ ] Accessibility Compliance
- [ ] Cross-browser Testing
- [ ] Performance Auditing
- [ ] User Acceptance Testing

---

## 📊 Design System Status

### ✅ Defined Standards

- **Color Palette**: Production-ready color system
- **Typography**: Inter font family + scale
- **Component Architecture**: React + TypeScript
- **State Management**: GraphQL + Apollo Client
- **Styling**: Tailwind CSS + CSS-in-JS

### ⏳ In Development

- **Component Library**: Reusable UI components
- **Design Tokens**: CSS custom properties
- **Animation System**: Micro-interactions
- **Responsive Breakpoints**: Device optimization

### 🔮 Future Enhancements

- **Dark Mode**: Theme switching
- **Accessibility**: ARIA compliance
- **Internationalization**: Multi-language support
- **Advanced Animations**: Framer Motion integration

Bu UI rehberi **modern web standartları** ile uyumlu ve mevcut GraphQL API sistemi ile tam entegre olacak şekilde tasarlanmıştır. 🎨
