# Timetable Module

The Timetable module allows users to manage their course schedules, including importing from external sources (like school systems) and manual entries.

## Data Model

The core data structure is the `TimetableEntry`:

```go
type TimetableEntry struct {
	ID        uint64 `gorm:"primaryKey"`
	UserID    uint64 `gorm:"index"`
	CourseID  uint64 `gorm:"index"`
	Title     string
	Teacher   string
	Location  string
	Day       int    // 1-7 (Mon-Sun)
	Sections  string // e.g., "1-2"
	Weeks     string // e.g., "1-16"
	Semester  string // e.g., "2024-2025-1"
	CreatedAt time.Time
	UpdatedAt time.Time
}
```

## API Endpoints

### List Timetable Entries
`GET /api/v1/timetable`
Returns all entries for the authenticated user, optionally filtered by semester.

### Create/Update Entry
`POST /api/v1/timetable`
Creates a new entry or updates an existing one for the user.

### Batch Import
`POST /api/v1/timetable/batch`
Imports multiple entries at once, typically used after parsing school schedule data.

### Delete Entry
`DELETE /api/v1/timetable/{id}`
Deletes a specific entry.
