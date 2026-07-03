# Project Create Feature

The project create feature lets a user create a new CCTV survey project and optionally set the initial map location.

## Files

- `ProjectCreatePage.tsx` renders the page shell, navbar, back link, and create form.
- `components/ProjectCreateForm.tsx` owns the form state, validation, map picker state, and create request.
- `index.ts` exports `ProjectCreatePage` for feature-level imports.

## Component Flow

``` mermaid
flowchart TD
  index["create/index.ts"] -- exports --> ProjectCreatePage

  ProjectCreatePage -- hook --> useNavigate
  ProjectCreatePage -- renders --> Navbar
  ProjectCreatePage -- renders --> ProjectCreateForm

  ProjectCreateForm -- state --> formFields["name, description, lat, lng, zoom"]
  ProjectCreateForm -- hook --> useCreateProject
  ProjectCreateForm -- hook --> useToast
  ProjectCreateForm -- renders --> ProjectLocationPicker

  ProjectLocationPicker -- updates --> formFields
  useCreateProject -- api --> createProject["POST /projects"]
  createProject -- success --> handleCreated["navigate /projects/:id"]
  ProjectCreateForm -- cancel --> cancel["navigate /"]
```

## Page Behavior

`ProjectCreatePage` uses `useNavigate` from React Router.

- Cancel sends the user back to `/`.
- Successful creation sends the user to `/projects/:id`.
- The page delegates all create-form behavior to `ProjectCreateForm`.

## Form Behavior

`ProjectCreateForm` tracks these local values:

- `name`
- `description`
- `lat`
- `lng`
- `zoom`
- `submitError`

The form requires a project name between 1 and 100 characters. Description is optional and limited to 500 characters.

Location is optional, but latitude and longitude must be provided together. Latitude must be between `-90` and `90`, longitude between `-180` and `180`, and zoom between `1` and `22`.

## Create Request

On submit, the form calls `useCreateProject`.

```ts
createProject({
  name: name.trim(),
  description: description.trim(),
  center_lat: hasLocation ? latNum : null,
  center_lng: hasLocation ? lngNum : null,
  default_zoom: hasLocation ? zoomNum : null,
});
```

On success, the form shows a success toast and calls `onCreated(project)`. On failure, it stores a submit error and shows an error toast.

## Map Picker

`ProjectLocationPicker` receives the current `lat`, `lng`, and `zoom` values. When the user clicks the map, drags the marker, or changes zoom, it calls `onChange`, and the form updates its location fields.
