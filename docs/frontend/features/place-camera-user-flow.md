# User Flow: Placing a Camera on the Map

This diagram shows how a user selects a camera model, places cameras in the project workspace, adjusts a placement, and saves the changes to the project.

```mermaid
flowchart TD
  A([Open project map]) --> B{Camera model already selected?}
  B -- No --> C[Open Camera Catalog]
  C --> D[Choose and select a camera model]
  B -- Yes --> E[Choose Place Camera]
  D --> E
  E --> F[Camera Insert Mode starts]
  F --> G{Next action}
  G -- Click map --> H[Create pending camera placement]
  H --> I{Place another camera?}
  I -- Yes --> G
  I -- No --> J[Exit Insert Mode]
  G -- X or Esc --> J
  J --> K[Optionally select, edit, or drag camera]
  K --> L[Open Project panel and save changes]
  L --> M{Save successful?}
  M -- Yes --> N([Camera saved to project])
  M -- No --> O[Camera remains dirty or failed]
  O -- Retry --> L
```

## Notes

- **Place Camera** is disabled until a camera model has been selected from the Camera Catalog.
- Each map click in Camera Insert Mode creates another local camera placement, so the user can place several cameras before leaving the mode.
- A newly placed or edited camera remains pending in the workspace until **Save changes** is used in the Project panel.
- Selecting a marker opens its camera panel. The user can edit its label, color, height, bearing, target values, or drag it to a different map position before saving.
