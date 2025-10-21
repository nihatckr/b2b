{
"collection": {
"id": "PROD-TEE-001",
"name": "Men Slim Fit Basic Tee",
"category": "Top",
"gender": "Men",
"status": "development",
"season": {
"id": "SEASON-SS25",
"code": "SS25",
"name": "Spring/Summer 2025",
"delivery_window_start": "2025-02-01",
"delivery_window_end": "2025-05-30"
},
"fit": {
"id": "FIT-MEN-SLIM-TEE",
"name": "Slim Fit",
"body_type": "Standard",
"measurement_mode": "Garment",
"ease_notes": "Chest +4cm, Waist +2cm",
"size_group": {
"id": "SG-MEN-TOP",
"region": "EU",
"sizes": ["S", "M", "L", "XL"]
},
"measurements": [
{"size": "S", "chest": 98, "waist": 96, "length": 69, "sleeve": 20},
{"size": "M", "chest": 100, "waist": 98, "length": 70, "sleeve": 21},
{"size": "L", "chest": 104, "waist": 102, "length": 71, "sleeve": 22},
{"size": "XL", "chest": 108, "waist": 106, "length": 72, "sleeve": 23}
]
},
"colors": [
{
"id": "COL-WHT-001",
"name": "Optic White",
"standard": "Pantone 11-0601 TCX",
"swatch_hex": "#F5F5F5"
},
{
"id": "COL-BLK-002",
"name": "Jet Black",
"standard": "Pantone 19-0303 TCX",
"swatch_hex": "#1C1C1C"
}
],
"fabrics": [
{
"id": "FAB-JER-001",
"name": "Organic Cotton Single Jersey",
"composition": "100% Organic Cotton",
"weight_gsm": 160,
"width_cm": 150,
"finish": "Bio Enzyme Wash",
"supplier": {
"id": "SUP-FAB-001",
"name": "EcoText Mill",
"country": "Turkey"
},
"certifications": [
{
"id": "CERT-GOTS-001",
"scheme": "GOTS",
"scope": "fabric",
"issuer": "Control Union",
"valid_until": "2026-05-01"
}
]
}
],
"accessories": [
{
"id": "ACC-LBL-001",
"type": "Main Label",
"material": "Recycled Polyester",
"size_spec": "30x60 mm",
"color_id": "COL-BLK-002",
"supplier": {
"id": "SUP-TRIM-001",
"name": "LabelWorks"
},
"certifications": [
{
"id": "CERT-GRS-002",
"scheme": "GRS",
"scope": "accessory",
"issuer": "Intertek",
"valid_until": "2025-12-31"
}
]
},
{
"id": "ACC-HNG-002",
"type": "Hanger Loop",
"material": "Cotton Tape",
"size_spec": "6 mm width",
"color_id": "COL-WHT-001"
}
],
"certifications": [
{
"id": "CERT-OEKO-003",
"scheme": "OEKO-TEX Standard 100",
"scope": "product",
"issuer": "Hohenstein",
"valid_until": "2026-02-15"
}
],
"bom": {
"bom_id": "BOM-TEE-001-V1",
"version": 1,
"status": "approved",
"lines": [
{
"component_type": "fabric",
"component_ref_id": "FAB-JER-001",
"color_id": "COL-WHT-001",
"consumption_per_unit": 0.35,
"consumption_uom": "m",
"wastage_pct": 3,
"placement": "body"
},
{
"component_type": "accessory",
"component_ref_id": "ACC-LBL-001",
"consumption_per_unit": 1,
"consumption_uom": "pcs",
"placement": "neck"
},
{
"component_type": "accessory",
"component_ref_id": "ACC-HNG-002",
"consumption_per_unit": 1,
"consumption_uom": "pcs",
"placement": "neck inner"
}
]
},
"variants": [
{
"variant_id": "VAR-TEE-001-WHT-M",
"color_id": "COL-WHT-001",
"size": "M",
"sku": "TEE001-WHT-M",
"barcode": "8680099900011"
},
{
"variant_id": "VAR-TEE-001-BLK-L",
"color_id": "COL-BLK-002",
"size": "L",
"sku": "TEE001-BLK-L",
"barcode": "8680099900012"
}
],
"target_cost": {
"fabric": 1.25,
"accessories": 0.35,
"making": 1.80,
"overhead": 0.40,
"total": 3.80,
"currency": "USD"
},
"created_by": "user_102",
"created_at": "2025-10-21",
"tags": ["men", "tshirt", "slimfit", "organic", "ss25"]
}
}
