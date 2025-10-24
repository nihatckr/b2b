const TabsPagination = () => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Platform Standards</span>
            <span className="sm:hidden">Platform</span>
            <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
              {platformData.length}
            </span>
          </TabsTrigger>

          {!isAdmin && (
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">My Company</span>
              <span className="sm:hidden">Company</span>
              <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                {companyData.length}
              </span>
            </TabsTrigger>
          )}

          {isAdmin && (
            <TabsTrigger
              value="all-companies"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">All Companies</span>
              <span className="sm:hidden">All</span>
              <span className="ml-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                {allCompaniesData.length}
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Add Button */}
        {activeTab === "platform" && isAdmin && (
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => handleOpenCreateModal("PLATFORM_STANDARD")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Size Group
          </Button>
        )}

        {activeTab === "company" && !isAdmin && (
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => handleOpenCreateModal("COMPANY_CUSTOM")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Size Group
          </Button>
        )}
      </div>

      {/* Platform Standards Tab */}
      <TabsContent value="platform" className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold">Platform Standards</h3>
            <span className="text-sm text-muted-foreground">
              (Visible to all users)
            </span>
          </div>

          {platformResult.fetching ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading size groups...
            </div>
          ) : platformData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">
                No platform standard size groups yet
              </p>
              {isAdmin && (
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Standard Size Group
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {platformData.map((sizeGroup) => {
                const sizes = getSizes(sizeGroup.data);
                const category = getSizeCategory(sizeGroup.data);
                const regional = getRegionalStandard(sizeGroup.data);
                const gender = getTargetGender(sizeGroup.data);

                return (
                  <div
                    key={sizeGroup.id}
                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{sizeGroup.name}</h4>
                      {sizeGroup.isPopular && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground mb-3">
                      {regional && <p>Region: {regional}</p>}
                      {gender && <p>Gender: {gender}</p>}
                      {category && <p>Category: {category}</p>}
                    </div>

                    {sizes.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-2">
                          Sizes:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {sizes.map((size: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {sizeGroup.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {sizeGroup.description}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewDetails(sizeGroup)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(sizeGroup)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteItem(sizeGroup)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </TabsContent>

      {/* My Company Tab */}
      {!isAdmin && (
        <TabsContent value="company" className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold">My Company Size Groups</h3>
              <span className="text-sm text-muted-foreground">
                (Only visible to your team)
              </span>
            </div>

            {companyResult.fetching ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading your size groups...
              </div>
            ) : companyData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  No custom size groups yet
                </p>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Custom Size Group
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyData.map((sizeGroup) => {
                  const sizes = getSizes(sizeGroup.data);
                  const category = getSizeCategory(sizeGroup.data);
                  const regional = getRegionalStandard(sizeGroup.data);
                  const gender = getTargetGender(sizeGroup.data);

                  return (
                    <div
                      key={sizeGroup.id}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{sizeGroup.name}</h4>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          Custom
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground mb-3">
                        {regional && <p>Region: {regional}</p>}
                        {gender && <p>Gender: {gender}</p>}
                        {category && <p>Category: {category}</p>}
                      </div>

                      {sizes.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-2">
                            Sizes:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {sizes.map((size: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewDetails(sizeGroup)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(sizeGroup)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteItem(sizeGroup)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      )}

      {/* All Companies Tab */}
      {isAdmin && (
        <TabsContent value="all-companies" className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold">
                All Companies&apos; Custom Size Groups
              </h3>
              <span className="text-sm text-muted-foreground">
                (Admin view only)
              </span>
            </div>

            {allCompaniesResult.fetching ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading all companies&apos; size groups...
              </div>
            ) : allCompaniesData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No company custom size groups yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCompaniesData.map((sizeGroup) => {
                  const sizes = getSizes(sizeGroup.data);
                  const regional = getRegionalStandard(sizeGroup.data);
                  const gender = getTargetGender(sizeGroup.data);

                  return (
                    <div
                      key={sizeGroup.id}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      {sizeGroup.company && (
                        <p className="text-xs text-muted-foreground mb-2 font-medium">
                          🏢 {sizeGroup.company.name}
                        </p>
                      )}

                      <h4 className="font-medium mb-2">{sizeGroup.name}</h4>

                      <div className="space-y-1 text-xs text-muted-foreground mb-3">
                        {regional && <p>Region: {regional}</p>}
                        {gender && <p>Gender: {gender}</p>}
                      </div>

                      {sizes.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {sizes.map((size: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded"
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewDetails(sizeGroup)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
};

export default TabsPagination;
