# Camera Model Export and Import Implementation Plan

## Scope

Included:

- Export one camera model at a time.
- Include the model data and its effective image.
- Import one exported package at a time.
- Use only the active `CameraSpecification` model.
- Generate normal creation IDs in the frontend.
- Reuse the source ID during import when available.
- Generate a new frontend ID when the source ID conflicts.

Excluded:

- Project placements.
- User accounts.
- Camera-model migration from the legacy `CameraModel`.
- Bulk catalog operations.
- Cross-version migration beyond the defined export schema.

The active model is `packages/backend/app/db_schemas/camera_specification.py`.

## Stage 1: Finalize the interchange contract

Define a versioned ZIP format:

```text
camera-model-export.zip
├── manifest.json
├── model.json
└── image.webp
```

Example `manifest.json`:

```json
{
  "format": "cctv-planner-camera-model",
  "schema_version": 1,
  "source_id": "66584aef0f5f3e6d8f8a1234",
  "model_file": "model.json",
  "image_file": "image.webp",
  "image_source": "custom",
  "image_sha256": "..."
}
```

`model.json` should contain:

- `name`
- `manufacturer`
- `model`
- `camera_type`
- `lens_spec`
- `sensor_spec`
- `ir_range`

Do not export:

- `image_storage_key`
- `image_version`
- `created_by`
- Internal database links
- Destination-specific timestamps

The image should always be included:

- Custom image if available.
- Otherwise the camera-type default image.

This makes the package self-contained for another system.

### Deliverables

- Export schema definition.
- JSON examples.
- Schema-versioning rules.
- Documentation of required and optional fields.

## Stage 2: Align ID generation

Normal model creation already generates the ID in the frontend through:

`packages/frontend/src/features/camera-model/utils/cameraSpecId.ts`

and:

`packages/frontend/src/features/camera-model/hooks/useAdminCameraCreate.ts`

Required adjustments:

1. Treat the frontend-generated ID as mandatory for normal creation.
2. Align the TypeScript and backend schemas so both require an ID for normal creation.
3. Keep the existing 24-character hexadecimal/ObjectId-compatible format.
4. Do not generate a replacement ID in the backend during normal creation.
5. Retain backend validation to reject malformed or unsafe IDs.

For import:

1. Read the source ID from `manifest.json`.
2. Check whether it is available in the destination system.
3. If available, use it.
4. If already used, generate a new ID in the frontend using `createCameraSpecId()`.
5. Send the selected source-to-destination ID mapping with the import request.
6. The backend must re-check the ID during final import to protect against race conditions.

Example mapping:

```json
{
  "source_id": "66584aef0f5f3e6d8f8a1234",
  "target_id": "66584aef0f5f3e6d8f8a1234"
}
```

For a conflict:

```json
{
  "source_id": "66584aef0f5f3e6d8f8a1234",
  "target_id": "66584b9a0f5f3e6d8f8a5678"
}
```

## Stage 3: Implement backend export

Add a single-model endpoint:

```text
GET /api/v1/camera-specs/{camera_spec_id}/export
```

Implementation responsibilities:

1. Load the camera specification.
2. Resolve its effective image: custom stored image or type default.
3. Build `manifest.json`.
4. Build `model.json`.
5. Add the image to an in-memory or temporary ZIP archive.
6. Return the archive as a download.
7. Use a safe filename derived from the model name.

Suggested modules:

```text
packages/backend/app/
├── services/
│   └── camera_spec_export_service.py
├── api_models/
│   └── camera_spec_export.py
└── routers/
    └── camera_spec.py
```

The export service should be separate from the router so it can be tested independently.

### Acceptance criteria

- Exported package opens as a valid ZIP.
- It contains exactly one model and one image.
- Default images are included.
- Exported JSON validates against the export schema.
- Exported image checksum matches the manifest.
- Missing camera models return `404`.
- Export does not expose internal storage paths or user information.

## Stage 4: Implement import preview

Add an upload-validation endpoint:

```text
POST /api/v1/camera-specs/import/preview
```

The frontend uploads the ZIP and receives model, image, validation, and ID availability information, including a suggested target ID when the source ID is already in use.

The preview endpoint should:

- Validate the ZIP structure.
- Validate the manifest.
- Validate `schema_version`.
- Validate the model against the active camera specification schemas.
- Validate the image.
- Check source ID availability.
- Return a suggested target ID if there is a conflict.
- Perform no database writes.

The frontend should show:

- Model name and manufacturer.
- Image preview.
- Source ID.
- Whether the source ID is available.
- The replacement ID if required.
- Validation errors and warnings.
- Confirm and cancel controls.

## Stage 5: Implement import execution

Add:

```text
POST /api/v1/camera-specs/import
```

The request should contain the validated archive and the frontend-selected ID mapping.

Import flow:

1. Revalidate the entire archive.
2. Validate the target ID format.
3. Check the target ID again immediately before insert.
4. Reject the import if the target ID became occupied.
5. Validate manufacturer/model uniqueness.
6. Create the camera specification using the target ID.
7. Store the normalized image using the existing image service.
8. Update image metadata.
9. Return the created camera record and source-to-target mapping.

Because model creation and image upload are currently separate operations, the import service should handle both as one coordinated workflow.

If image storage fails after database insertion, remove the newly created database record or perform deterministic cleanup. The preferred approach is rollback/cleanup so incomplete models are not left behind.

## Stage 6: Add frontend export/import controls

Place the functionality in the existing camera-model feature:

```text
packages/frontend/src/features/camera-model/
├── api/
│   └── cameraSpecTransfer.ts
├── hooks/
│   └── useCameraSpecTransfer.ts
├── components/
│   ├── CameraExportButton.tsx
│   ├── CameraImportDialog.tsx
│   └── CameraImportPreview.tsx
└── utils/
    └── cameraSpecId.ts
```

### Export UX

Add an `Export` action to `CameraCardActions.tsx`.

Behavior:

- Download the ZIP.
- Use a readable filename such as `hikvision-ds-2cd1123g0-i.zip`.
- Show an error toast if export fails.

### Import UX

Add an `Import Camera Specification` action to `CameraListHeader.tsx`.

Behavior:

1. Select a ZIP file.
2. Upload it for preview.
3. Display validation and conflict information.
4. Generate a new ID in the frontend if required.
5. Confirm the import.
6. Refresh the camera list.
7. Navigate to or display the imported model.

The frontend should not trust the archive contents merely because the file extension is `.zip`.

## Stage 7: Implement security controls

### Archive security

- Accept only ZIP archives.
- Reject path traversal entries such as `../file` or absolute paths.
- Reject duplicate filenames.
- Allow only `manifest.json`, `model.json`, and `image.webp`.
- Reject unexpected files.
- Enforce maximum upload size.
- Enforce maximum decompressed size.
- Enforce maximum file count.
- Reject nested archives.
- Reject symlinks and special file entries.
- Avoid extracting directly into permanent storage.
- Prefer in-memory processing or a securely created temporary directory.

### JSON security

- Parse with strict Pydantic schemas.
- Reject unknown or unsupported schema versions.
- Enforce string length limits.
- Enforce numeric ranges.
- Enforce allowed enum values.
- Reject excessively deep or oversized JSON.
- Never use imported values to construct filesystem paths.

### Image security

Reuse `packages/backend/app/services/camera_spec_image_service.py` and additionally:

- Validate actual image content, not only extension or MIME type.
- Enforce maximum source dimensions.
- Enforce maximum decoded pixel count.
- Reject animated images.
- Normalize to WebP.
- Apply EXIF orientation safely.
- Verify the normalized output before storage.
- Calculate and verify the SHA-256 checksum.
- Store using the generated target ID, never an archive filename.

### Database and authorization security

- Require authenticated admin access for export/import.
- Re-check source and target IDs server-side.
- Rely on the unique manufacturer/model index.
- Handle duplicate-key errors cleanly.
- Do not allow imported data to set ownership fields.
- Do not allow imported data to set arbitrary timestamps or storage keys.
- Avoid leaking whether unrelated records exist through overly detailed errors.
- Log import/export events without logging image contents or secrets.

### Denial-of-service protection

- Limit request body size.
- Apply rate limits to import/export endpoints if supported by the infrastructure.
- Process only one model per archive.
- Set timeouts for archive validation.
- Delete temporary files on success and failure.
- Monitor failed archive-validation attempts.

## Stage 8: Testing strategy

### Backend tests

Add tests for:

- Valid export structure.
- Export with a custom image.
- Export with a default image.
- Correct image checksum.
- Invalid camera ID.
- Missing camera model.
- Invalid archive structure.
- Path traversal archive entries.
- Oversized archive.
- Oversized decompressed content.
- Malformed JSON.
- Invalid model fields.
- Invalid or corrupt image.
- Available source ID.
- Source ID conflict.
- Target ID conflict during final import.
- Duplicate manufacturer/model.
- Image-storage failure and cleanup.
- Successful model and image import.

### Frontend tests

Test:

- Export download behavior.
- Import preview states.
- Invalid archive errors.
- Source ID available state.
- Conflict state.
- Frontend generation of replacement ID.
- Import success and list refresh.
- Import failure handling.

### Integration test

1. Create a model in System A.
2. Export it with its image.
3. Import it into System B with the same source ID.
4. Confirm that the model and image match.
5. Import it again and confirm that a new ID is used when required.

## Recommended delivery sequence

| Stage | Outcome |
|---|---|
| 1 | Versioned export contract |
| 2 | Consistent frontend-only creation ID behavior |
| 3 | Single-model export endpoint |
| 4 | Secure import preview |
| 5 | Conflict-aware import execution |
| 6 | Frontend export/import UI |
| 7 | Security hardening |
| 8 | Automated and end-to-end tests |

## Estimated effort

Approximately 7–12 developer days:

- Contract and ID alignment: 1–2 days.
- Export: 1–2 days.
- Import preview and validation: 2 days.
- Import execution and rollback: 2–3 days.
- Frontend UI: 1–2 days.
- Security and tests: 2–3 days.

The key rule is that normal creation IDs remain frontend-generated. During import, the source ID is used only after server validation; if it conflicts, the frontend generates a replacement ID and submits that mapping for final server-side verification.
