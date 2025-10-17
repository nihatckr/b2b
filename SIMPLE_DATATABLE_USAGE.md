# Samples Page - SimpleDataTable Integration

Bu sayfa artık `SimpleDataTable` reusable component'ini kullanıyor.

## Yapılan Değişiklikler

1. **SimpleDataTable import edildi**:
```tsx
import { SimpleDataTable, ColumnDef } from "@/components/DataTable";
```

2. **Column definitions oluşturuldu**:
- Görsel
- Numune No (sortable)
- Koleksiyon (sortable)
- Tip
- Durum (sortable)
- Üretici/Talep Eden
- Tarih (sortable)
- İşlemler

3. **Card grid yerine SimpleDataTable kullanıldı**:
```tsx
<SimpleDataTable
  data={filteredSamples}
  columns={columns}
  getRowKey={(sample) => sample.id}
  defaultSortField="createdAt"
  defaultSortDirection="desc"
  emptyMessage="..."
/>
```

## Avantajlar

✅ **Reusable**: Başka sayfalarda da kullanılabilir
✅ **Sortable**: 4 sütun sıralanabilir
✅ **Clean Code**: Daha az kod, daha temiz yapı
✅ **Type-safe**: TypeScript desteği
✅ **Maintainable**: Tek yerden yönetilebilir

## Diğer Sayfalar İçin

Aynı component'i şu sayfalarda da kullanabilirsiniz:
- Orders (Siparişler)
- Collections (Koleksiyonlar)
- Production (Üretim)
- Users (Kullanıcılar)
- Companies (Firmalar)

## Örnek Kullanım

```tsx
const columns: ColumnDef<MyType>[] = [
  {
    id: 'name',
    header: 'İsim',
    accessorKey: 'name',
    sortable: true,
  },
  {
    id: 'actions',
    header: 'İşlemler',
    cell: (row) => (
      <Button onClick={() => handleAction(row.id)}>
        Düzenle
      </Button>
    ),
  },
];

<SimpleDataTable
  data={items}
  columns={columns}
  getRowKey={(item) => item.id}
/>
```
