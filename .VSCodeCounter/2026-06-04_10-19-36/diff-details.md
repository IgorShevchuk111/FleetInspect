# Diff Details

Date : 2026-06-04 10:19:36

Directory /Users/igor/Desktop/fleetInspect/app

Total : 42 files,  1375 codes, 1037 comments, 203 blanks, all 2615 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [app/(auth)/auth/callback/route.ts](/app/(auth)/auth/callback/route.ts) | TypeScript | 16 | 0 | 7 | 23 |
| [app/(auth)/login/page.tsx](/app/(auth)/login/page.tsx) | TypeScript JSX | 8 | 0 | 3 | 11 |
| [app/(auth)/signup/page.tsx](/app/(auth)/signup/page.tsx) | TypeScript JSX | 323 | 7 | 64 | 394 |
| [app/(dashboard)/(inspections)/inspection/[vehicleId]/loading.tsx](/app/(dashboard)/(inspections)/inspection/%5BvehicleId%5D/loading.tsx) | TypeScript JSX | 4 | 0 | 2 | 6 |
| [app/(dashboard)/(inspections)/inspection/[vehicleId]/page.tsx](/app/(dashboard)/(inspections)/inspection/%5BvehicleId%5D/page.tsx) | TypeScript JSX | 1,364 | 60 | 108 | 1,532 |
| [app/(dashboard)/(inspections)/inspection/error.tsx](/app/(dashboard)/(inspections)/inspection/error.tsx) | TypeScript JSX | 14 | 0 | 3 | 17 |
| [app/(dashboard)/(inspections)/inspection/layout.tsx](/app/(dashboard)/(inspections)/inspection/layout.tsx) | TypeScript JSX | 7 | 0 | 1 | 8 |
| [app/(dashboard)/(inspections)/inspection/loading.tsx](/app/(dashboard)/(inspections)/inspection/loading.tsx) | TypeScript JSX | 4 | 0 | 2 | 6 |
| [app/(dashboard)/(inspections)/inspection/page.tsx](/app/(dashboard)/(inspections)/inspection/page.tsx) | TypeScript JSX | 30 | 3 | 7 | 40 |
| [app/(dashboard)/(inspections)/inspections/page.tsx](/app/(dashboard)/(inspections)/inspections/page.tsx) | TypeScript JSX | 49 | 0 | 7 | 56 |
| [app/(dashboard)/(inspections)/user-inspections/page.tsx](/app/(dashboard)/(inspections)/user-inspections/page.tsx) | TypeScript JSX | 79 | 5 | 9 | 93 |
| [app/(dashboard)/profile/page.tsx](/app/(dashboard)/profile/page.tsx) | TypeScript JSX | 200 | 363 | 89 | 652 |
| [app/(dashboard)/reports/page.tsx](/app/(dashboard)/reports/page.tsx) | TypeScript JSX | 42 | 626 | 48 | 716 |
| [app/(dashboard)/timesheets/page.tsx](/app/(dashboard)/timesheets/page.tsx) | TypeScript JSX | 50 | 1 | 6 | 57 |
| [app/api/vehicles/route.ts](/app/api/vehicles/route.ts) | TypeScript | 33 | 17 | 15 | 65 |
| [app/error.tsx](/app/error.tsx) | TypeScript JSX | 15 | 0 | 3 | 18 |
| [app/globals.css](/app/globals.css) | CSS | 128 | 2 | 12 | 142 |
| [app/layout.tsx](/app/layout.tsx) | TypeScript JSX | 96 | 5 | 9 | 110 |
| [app/loading.tsx](/app/loading.tsx) | TypeScript JSX | 4 | 0 | 2 | 6 |
| [app/metadata.ts](/app/metadata.ts) | TypeScript | 42 | 0 | 2 | 44 |
| [app/not-found.tsx](/app/not-found.tsx) | TypeScript JSX | 17 | 0 | 3 | 20 |
| [app/page.tsx](/app/page.tsx) | TypeScript JSX | 41 | 0 | 5 | 46 |
| [app/providers.tsx](/app/providers.tsx) | TypeScript JSX | 4 | 0 | 2 | 6 |
| [features/inspections/actions.ts](/features/inspections/actions.ts) | TypeScript | -154 | -29 | -36 | -219 |
| [features/inspections/components/EmptyInspectionsState.tsx](/features/inspections/components/EmptyInspectionsState.tsx) | TypeScript JSX | -23 | -1 | -5 | -29 |
| [features/inspections/components/HeaderInspections.tsx](/features/inspections/components/HeaderInspections.tsx) | TypeScript JSX | -24 | 0 | -3 | -27 |
| [features/inspections/components/InspectionCardLayout.tsx](/features/inspections/components/InspectionCardLayout.tsx) | TypeScript JSX | -9 | 0 | -1 | -10 |
| [features/inspections/components/InspectionListContent.tsx](/features/inspections/components/InspectionListContent.tsx) | TypeScript JSX | -30 | 0 | -7 | -37 |
| [features/inspections/components/InspectionMobileCards.tsx](/features/inspections/components/InspectionMobileCards.tsx) | TypeScript JSX | -57 | 0 | -11 | -68 |
| [features/inspections/components/InspectionOperations.tsx](/features/inspections/components/InspectionOperations.tsx) | TypeScript JSX | -31 | 0 | -3 | -34 |
| [features/inspections/components/InspectionStatusBadge.tsx](/features/inspections/components/InspectionStatusBadge.tsx) | TypeScript JSX | -17 | 0 | -4 | -21 |
| [features/inspections/components/InspectionTable.tsx](/features/inspections/components/InspectionTable.tsx) | TypeScript JSX | -88 | 0 | -12 | -100 |
| [features/inspections/components/TripSelector.tsx](/features/inspections/components/TripSelector.tsx) | TypeScript JSX | -36 | 0 | -8 | -44 |
| [features/inspections/hooks/useFilteredInspections.ts](/features/inspections/hooks/useFilteredInspections.ts) | TypeScript | -73 | 0 | -12 | -85 |
| [features/inspections/inspectionHelpers.ts](/features/inspections/inspectionHelpers.ts) | TypeScript | -17 | 0 | -1 | -18 |
| [features/inspections/inspectionStyles.ts](/features/inspections/inspectionStyles.ts) | TypeScript | -21 | -1 | -3 | -25 |
| [features/inspections/services.ts](/features/inspections/services.ts) | TypeScript | -137 | -8 | -40 | -185 |
| [features/inspections/storage.ts](/features/inspections/storage.ts) | TypeScript | -19 | 0 | -5 | -24 |
| [features/timesheets/components/TimesheetForm.tsx](/features/timesheets/components/TimesheetForm.tsx) | TypeScript JSX | -314 | -13 | -16 | -343 |
| [features/vehicles/actions/searchVehicles.ts](/features/vehicles/actions/searchVehicles.ts) | TypeScript | -14 | 0 | -7 | -21 |
| [features/vehicles/components/VehicleSearch.tsx](/features/vehicles/components/VehicleSearch.tsx) | TypeScript JSX | -58 | 0 | -11 | -69 |
| [features/vehicles/hooks/useVehicleSearch.ts](/features/vehicles/hooks/useVehicleSearch.ts) | TypeScript | -73 | 0 | -21 | -94 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details