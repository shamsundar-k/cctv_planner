# Camera Specification Image Feature — Implementation Plan

## Purpose

Implement optional image support for camera specifications in the CCTV Planner application.

Each reusable camera specification in the catalog may have:

- A custom image uploaded by the user.
- A type-specific default image when no custom image exists.

This feature applies to camera specification records used in the catalog. It does not apply to individual camera placements on the map.

---

## Important Identifier Distinction

The application uses two different identifiers.

### Camera Specification ID

Identifies a reusable camera model in the catalog. The image must be associated with this identifier.

### Camera Placement UID

Identifies one camera instance placed on the map. Multiple placements may reference the same camera specification.

Do not store separate catalog images using the placement UID.

```text
Camera Specification
ID: spec-123
Image: custom/spec-123.webp

Placed Camera A
UID: placement-a
camera_spec_id: spec-123

Placed Camera B
UID: placement-b
camera_spec_id: spec-123
```

Both placements use the same camera specification image.

---

## Scope

Implement:

- Optional image upload when creating or updating a camera specification.
- Server-side image validation and normalization.
- Storage of custom images using the camera specification ID.
- Type-specific default images.
- A stable image retrieval endpoint.
- Server-side fallback from custom image to default image.
- Image replacement and removal.
- Error handling and tests.

- For theme for the UI refer the "cctv-theme" file in styles folder in frontend.

Do not implement:

- Images for individual camera placements.
- Multiple images per camera specification.
- Image galleries.
- For now do not auth protect the image fectching API in backend. Later this be implimented.
- Image cropping UI.
- Cloud object storage unless required by the current deployment.
- React folder or component restructuring rules.

Use the existing React refactoring skill for frontend code organization.

---

## Existing Behavior to Preserve

Camera placements reference a camera specification through:

```text
camera_spec_id
```

The frontend will generate identifiers client-side. The backend must still:

- Validate the identifier format.
- Enforce uniqueness.
- Prevent unsafe filesystem usage.
- Verify authorization before image modification.

---

## Functional Requirements

### Optional image during creation

When creating a camera specification, the user may upload a custom image or skip the upload.

If skipped:

- Camera specification creation must still succeed.
- The catalog must display the default image for that camera type.

### Optional image during update

When editing a camera specification, the user may:

- Keep the current custom image.
- Replace the custom image.
- Remove the custom image and return to the default image.

### Type-specific defaults

Maintain one predefined default image for each supported camera type.

Initial types:

```text
dome
bullet
ptz
```

Suggested storage layout:

```text
camera-images/
├── custom/
│   ├── <camera-spec-id>.webp
│   └── <camera-spec-id>.webp
└── defaults/
    ├── dome.webp
    ├── bullet.webp
    └── ptz.webp
```

Map camera types to default paths using a controlled internal mapping. Do not construct paths directly from untrusted input.

---

## Recommended Retrieval Endpoint

```text
GET /camera-specs/{camera_spec_id}/image
```

Do not include camera type in the URL.

The backend can derive camera type from the camera specification record, preventing mismatches between the requested type and stored data.

---

## Retrieval Flow

```text
Client requests image
        ↓
Server validates camera_spec_id
        ↓
Server loads CameraSpec record
        ↓
CameraSpec exists?
   ├── No  → 404 Not Found
   └── Yes
        ↓
Custom image exists?
   ├── Yes → return custom image
   └── No  → return default image for CameraSpec.camera_type
```

Rules:

- Missing custom image returns the default image with HTTP 200.
- Missing camera specification returns HTTP 404.
- Do not return a default image for an invalid or nonexistent camera specification.

---

## Upload Flow

Recommended server-side sequence:

```text
Client has camera specification ID
        ↓
Create or confirm CameraSpec record
        ↓
CameraSpec operation succeeds
        ↓
Validate optional image
        ↓
Normalize image
        ↓
Store custom image using safe server-generated path
        ↓
Update image metadata/version if required
        ↓
Return completed response
```

If image upload fails after camera specification creation:

- The camera specification may remain valid.
- The default image should continue to work.
- The API should clearly report that the image operation failed.
- Do not leave partial files.

---

## File Naming and Storage Rules

Use a normalized path such as:

```text
custom/<camera-spec-id>.webp
```

Requirements:

- Validate the ID before path construction.
- Construct the final path only on the server.
- Use one normalized file extension.
- Do not preserve arbitrary uploaded filenames.
- Do not rely on the original filename for MIME detection.

Preferred normalized format:

```text
WebP
```

JPEG is acceptable if WebP support is not preferred in the backend stack.

---

## Image Metadata

Do not store image bytes in MongoDB.

The camera specification record may store minimal metadata such as:

```text
image_source: custom | default
image_version: integer
image_updated_at: datetime
```

Or:

```text
image_storage_key: optional string
image_version: integer
```

The exact model shape should follow existing backend conventions.
Make the required changes for the pydantic, DB schema models in backend and types in frontend.
Metadata should support:

- Detecting custom image presence.
- Recording replacement time.
- Future migration to object storage.

---

## Validation Requirements

Validate actual file content, not only the extension.

Required checks:

- Supported MIME type.
- Maximum file size.
- Maximum image dimensions.
- Minimum useful dimensions.
- Successful image decode.
- Rejection of malformed files.
- Rejection of unsupported formats.
- Rejection of animated images unless explicitly supported.
- Safe handling of transparent images.

Suggested accepted types:

```text
image/jpeg
image/png
image/webp
```

Suggested normalization flow:

```text
Decode
    ↓
Apply orientation
    ↓
Resize if above maximum dimensions
    ↓
Convert to RGB/RGBA as required
    ↓
Encode as WebP
```

Configure limits centrally.

Example limits:

```text
Maximum file size: 5 MB
Maximum width: 2000 px
Maximum height: 2000 px
Catalog output target: approximately 600 × 600 px
```

---

## Aspect Ratio and Catalog Presentation

Backend behavior:

- Preserve aspect ratio.
- Fit within a maximum bounding box.
- Do not stretch.

Frontend behavior:

- Use a fixed image area.
- Use `object-fit: contain`.
- Use neutral or transparent padding where needed.

This plan does not prescribe React component structure.

---

## Default Image Rules

Each default image should:

- Clearly represent the camera type.
- Use a neutral background or transparency.
- Work across all application themes.
- Avoid theme-specific text.
- Use consistent dimensions and visual scale.
- Be optimized for catalog rendering.

Files:

```text
defaults/dome.webp
defaults/bullet.webp
defaults/ptz.webp
```

When adding a new camera type:

- Add the enum value.
- Add its default image.
- Add the server-side mapping.
- Add a fallback test.

---

## API Design

Recommended endpoints:

```text
POST   /camera-specs
PUT    /camera-specs/{camera_spec_id}/image
GET    /camera-specs/{camera_spec_id}/image
DELETE /camera-specs/{camera_spec_id}/image
```

### Upload or replace

```text
PUT /camera-specs/{camera_spec_id}/image
```

Behavior:

- Validate camera specification existence.
- Validate authorization.
- Validate and normalize the image.
- Store replacement safely.
- Increment image version.
- Replace the old file only after the new file is ready.

### Retrieve

```text
GET /camera-specs/{camera_spec_id}/image
```

Behavior:

- Return custom image when present.
- Otherwise return the default image for the camera type.

### Remove custom image

```text
DELETE /camera-specs/{camera_spec_id}/image
```

Behavior:

- Remove only the custom image.
- Keep the camera specification.
- Increment image version or update timestamp.
- Future retrieval returns the default image.

---

## Atomic Replacement Strategy

```text
Validate new image
        ↓
Normalize into temporary file
        ↓
Confirm temporary file is valid
        ↓
Atomically replace final custom image
        ↓
Update image metadata/version
        ↓
Clean temporary file
```

Do not delete the old image before the replacement is ready.

---



## Frontend Behavior

The catalog should use one stable image URL:

```text
/camera-specs/{camera_spec_id}/image
```

Or:

```text
/camera-specs/{camera_spec_id}/image?v={image_version}
```

The frontend should not:

- Check whether a custom image exists.
- Construct default image paths.
- Send camera type in the image URL.
- Retry using a default image URL after a 404.

Frontend responsibilities:

- Display the image.
- Show loading state.
- Show a generic broken-image fallback only for unexpected failures.
- Refresh after upload, replacement, or removal.
- Use the existing React refactoring skill for file and component structure.

---

## Failure Handling

### Camera specification does not exist

```text
404 Not Found
```

Do not return a default image.

### Unsupported type or malformed image

Return the project-standard validation error.

Do not store the file.

### Oversized image

Return validation error with the configured maximum.

### Storage failure

Return server error.

Do not update metadata to indicate that a custom image exists.

### Metadata says custom but file is missing

- Log the inconsistency.
- Return the type-specific default image.
- Optionally repair metadata.

The catalog endpoint should remain resilient.

---

## Security Requirements

The backend must:

- Authenticate where required.
- Authorize create, replace, and delete operations.
- Validate camera specification ownership or project access.
- Validate identifier format.
- Prevent path traversal.
- Ignore uploaded path information.
- Generate storage paths internally.
- Reject executable or malformed content.
- Avoid exposing arbitrary upload-directory files.
- Set the correct response content type.
- Prefer `Content-Disposition: inline`.

Do not trust:

- File extension.
- Client-provided MIME type.
- Client-provided camera type for fallback.
- Client-provided storage path.
- Client-provided original filename.

---

## Deletion Behavior

When deleting a camera specification:

```text
Delete CameraSpec record
        ↓
Delete associated custom image if present
        ↓
Do not delete shared default images
```

If file deletion fails:

- Log the failure.
- Do not block database deletion unless strict cleanup is required.
- Allow later orphan-file cleanup.

---

## Existing Records and Migration

Existing camera specifications may not contain image metadata.

They should continue working:

```text
No custom image metadata
        ↓
Return default image based on camera_type
```

Prefer optional, backward-compatible metadata fields.

---

## Testing Plan

### Backend unit tests

Test:

- Valid JPEG, PNG, and WebP uploads.
- Unsupported format rejection.
- Oversized file rejection.
- Corrupt image rejection.
- Path traversal rejection.
- Correct normalization.
- Correct type-specific fallback.
- Missing camera specification returns 404.
- Custom image removal restores default fallback.
- Replacement increments version.
- Existing image remains if replacement fails.

### Backend integration tests

```text
Create CameraSpec without image
        ↓
GET image
        ↓
Default image returned
```

```text
Create CameraSpec
        ↓
Upload image
        ↓
GET image
        ↓
Custom image returned
```

```text
Replace image
        ↓
GET with new version
        ↓
New image returned
```

```text
Delete custom image
        ↓
GET image
        ↓
Default image returned
```

```text
Delete CameraSpec
        ↓
Custom file removed
```

### Frontend tests

Test:

- Catalog card uses stable image endpoint.
- Loading state.
- Successful image display.
- Upload updates preview.
- Replacement updates preview.
- Removal returns to server-provided default.
- Unexpected request failure shows generic fallback.
- Frontend does not construct camera-type default paths.

Use existing frontend testing and refactoring conventions.

---

## Acceptance Criteria

The feature is complete when:

1. A camera specification can be created without an image.
2. A camera specification can have a custom image uploaded.
3. The image is associated with the camera specification ID, not placement UID.
4. The custom image is stored using a safe server-generated path.
5. The image is normalized to the chosen format.
6. The catalog requests one stable image endpoint.
7. The server returns the custom image when present.
8. The server returns the correct type-specific default when no custom image exists.
9. The server returns 404 when the camera specification does not exist.
10. The client does not include camera type in the image URL.
11. A custom image can be replaced.
12. A custom image can be removed.
13. Removing a custom image restores default fallback automatically.
15. Invalid and oversized uploads are rejected.
16. Uploaded filenames cannot cause path traversal.
17. Existing camera specifications without image metadata continue to work.
18. Deleting a camera specification cleans up its custom image.
19. Tests cover custom, default, replace, remove, invalid upload, and missing-record flows.

---

## Implementation Phases

### Phase 1 — Defaults and configuration

- Add default camera images.
- Add camera-type-to-default-image mapping.
- Add upload limits and output format configuration.
- Verify default assets exist.

### Phase 2 — Retrieval endpoint

- Implement `GET /camera-specs/{camera_spec_id}/image`.
- Load the camera specification.
- Return custom image or type-specific default.

### Phase 3 — Upload and replacement

- Implement upload/replace endpoint.
- Validate and normalize.
- Store safely using camera specification ID.
- Update version metadata.
- Use atomic replacement.

### Phase 4 — Remove custom image

- Implement custom image removal.
- Keep camera specification unchanged.
- Ensure retrieval returns the default afterward.

### Phase 5 — Frontend integration

- Add optional image selection to create/edit workflows.
- Use the stable server endpoint.
- Refresh image URL after mutations.
- Leave React file structure decisions to the existing refactoring skill.

### Phase 6 — Cleanup

- Remove custom image when camera specification is deleted.
- Handle missing files safely.
- Add logging for orphan or inconsistent state.

### Phase 7 — Tests

- Add backend unit and integration tests.
- Add frontend behavior tests.
- Verify all camera types use correct defaults.

---

## Final Target Flow

### Without custom image

```text
User creates camera specification
        ↓
No image uploaded
        ↓
Camera specification saved
        ↓
Catalog requests image endpoint
        ↓
Server returns type-specific default image
```

### With custom image

```text
User creates camera specification
        ↓
User uploads image
        ↓
Server validates and normalizes image
        ↓
Server stores image by camera specification ID
        ↓
Catalog requests image endpoint
        ↓
Server returns custom image
```

### Image removal

```text
User removes custom image
        ↓
Server deletes custom file
        ↓
Server updates image version
        ↓
Catalog refreshes image URL
        ↓
Server returns type-specific default image
```

---

## Architecture Principle

```text
Frontend requests one stable image URL.

Backend owns:
- camera lookup
- custom image lookup
- default image selection
- validation
- normalization
- storage
- caching
- fallback behavior
```

Do not duplicate fallback rules in the frontend.
