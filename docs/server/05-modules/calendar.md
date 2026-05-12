# Calendar Module

The Calendar module provides tools for generating `.ics` files for calendar applications and managing manual calendar events.

## Features

1. **ICS Generation**: Converts course timetable data into standard iCalendar format.
2. **Manual Events**: Allows users to create personal events that coexist with their course schedule.
3. **Import Integration**: Support for importing data via cURL commands (legacy support for school systems).

## Data Model

### CalendarEvent
Used for manual events created by the user.

```go
type CalendarEvent struct {
	ID          uint64    `gorm:"primaryKey" json:"id"`
	UserID      uint64    `gorm:"index" json:"user_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	StartAt     time.Time `json:"start_at"`
	EndAt       time.Time `json:"end_at"`
	IsAllDay    bool      `json:"is_all_day"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
```

## API Endpoints

### Generate ICS
`POST /api/v1/calendar/generate`
Generates an ICS file string based on imported course data and a reference date (first Sunday of the semester).

### List Events
`GET /api/v1/calendar/events`
Returns all manual events for the authenticated user.

### Create Event
`POST /api/v1/calendar/events`
Creates a new manual calendar event.

### Delete Event
`DELETE /api/v1/calendar/events/{id}`
Deletes a specific manual event.
