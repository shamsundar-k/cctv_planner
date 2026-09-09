# Camera model transfer contract, version 1

This directory defines version 1 of the portable, single-camera-model interchange
format. A package is a ZIP archive containing exactly these three case-sensitive,
root-level regular files:

```text
camera-model-export.zip
├── manifest.json
├── model.json
└── image.webp
```

Directory entries, nested paths, symlinks, duplicate names, and additional files
are not part of this format. JSON files are UTF-8 encoded. `image.webp` is the
effective image for the model: the custom image when one exists, otherwise the
default image for the camera type. It must be a valid, non-animated WebP image.

The normative JSON Schemas are:

- [`manifest.schema.json`](manifest.schema.json)
- [`model.schema.json`](model.schema.json)

Example instances are in [`examples/manifest.json`](examples/manifest.json) and
[`examples/model.json`](examples/model.json). The example digest is illustrative;
an actual package must contain the digest of its own `image.webp` bytes.

## Manifest fields

| Field | Required | Rules |
|---|---:|---|
| `format` | Yes | Must be `cctv-planner-camera-model`. |
| `schema_version` | Yes | Must be integer `1`. |
| `source_id` | No | When present, a 24-character hexadecimal, ObjectId-compatible source identifier. The CCTV Planner v1 exporter always includes it. |
| `model_file` | Yes | Must be the literal root filename `model.json`. |
| `image_file` | Yes | Must be the literal root filename `image.webp`. |
| `image_source` | Yes | `custom` when the exported model has its own image; otherwise `default`. This is provenance only—the image bytes are always included. |
| `image_sha256` | Yes | Lowercase, 64-character hexadecimal SHA-256 digest of the exact `image.webp` bytes stored in the archive. |

Unknown manifest fields are invalid in version 1.

## Model fields

The exported model is intentionally limited to portable specification data. Its
shape mirrors the active `CameraSpecification` model.

| Field | Required | Rules |
|---|---:|---|
| `name` | Yes | Non-empty string, at most 200 characters. |
| `manufacturer` | Yes | Non-empty string, at most 200 characters. |
| `model` | Yes | Non-empty string, at most 200 characters. |
| `camera_type` | Yes | One of `dome`, `bullet`, or `ptz`. |
| `lens_spec` | Yes | Lens type plus focal-length, horizontal-FOV, and vertical-FOV ranges. |
| `sensor_spec` | Yes | Positive horizontal and vertical pixel resolution; optional sensor metadata. |
| `ir_range` | Yes | Number from 0 through 10,000, in metres. |

Every `lens_spec` member is required. `lens_type` is `fixed` or `varifocal`.
Focal-length bounds are positive millimetre values no greater than 1,000, with
`min <= max`. FOV bounds
are degrees strictly between 0 and 180 with `min <= max`. Fixed lenses require
equal bounds for all three ranges; varifocal lenses require different bounds for
all three ranges. These cross-field rules are normative and must be enforced by
the importer in addition to JSON Schema validation.

Within `sensor_spec`, `resolution` is required. `megapixel` and `sensor_size` are
optional and each may be omitted or explicitly `null`; a non-null megapixel value
must be positive and no greater than 1,000. Resolution dimensions are positive
integers no greater than 100,000, and `sensor_size` is at most 100 characters.
Unknown model or nested-object fields are invalid in version 1.

## Processing limits

The default v1 implementation applies these denial-of-service limits. Deployments
may lower them, but must not accept values beyond the model-field limits above:

- compressed upload: 8 MiB;
- total decompressed archive content: 8 MiB;
- each JSON file: 64 KiB;
- JSON nesting depth: 10;
- archive validation time: 10 seconds;
- source image: 5 MiB, 2,000 × 2,000 dimensions, and 4,000,000 decoded pixels.

Import endpoints accept one archive at a time and require an authenticated system
administrator. Archive member names never influence filesystem paths, and images
are stored only under the validated destination camera ID.

The following fields must never be present in `model.json`:

- database or ownership data, including `id`, `_id`, and `created_by`;
- image persistence data, including `image_storage_key`, `image_version`, and
  `image_updated_at`;
- timestamps, including `created_at` and `updated_at`;
- internal links, storage paths, or destination-specific metadata.

The portable source identifier belongs only in `manifest.json` as `source_id`.

## Versioning rules

1. `format` is the format-family discriminator and is matched exactly.
2. `schema_version` selects one immutable contract version. Importers must validate
   the manifest with the selected version before reading model data.
3. A change to filenames, fields, allowed values, validation rules, or semantics
   requires a new integer schema version and a new schema directory. Because v1
   rejects unknown fields, even new optional fields require a version bump.
4. Editorial clarifications and additional examples that do not change accepted
   data do not require a version bump.
5. Importers must reject unknown versions. They must not guess a version from ZIP
   contents or silently coerce a newer package into an older contract.
6. Exporters should emit the newest version they implement. A v1 importer only
   promises to accept packages with `schema_version: 1`.
