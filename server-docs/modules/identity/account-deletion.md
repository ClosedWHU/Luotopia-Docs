---
sidebar_position: 2
title: Account Deletion Policy
sidebar_label: 账号注销
description: Central-account deletion scope, retained records, and recovery window
---
# Account Deletion Policy

`identity_users` is the sole authoritative Luotopia account record. Local usernames,
forum nicknames, WHU student IDs, and device identifiers are not interchangeable.
In particular, a WHU CAS/device session only proves possession for a provider flow; it
does not create or replace a central identity session.

Deleting an account is one database transaction. It deletes private data: email and
external identity bindings, passkeys, sessions/refresh tokens, API credentials and
usage, devices, consents, notifications, timetable snapshots and entries, calendar
events, transcripts, completion records, grade submissions, forum profile state,
attachments, reactions, favorites, aliases, and memberships. Storage object rows owned
by the account are deleted inside that transaction; for each affected blob path the
transaction records a deletion intent, and the storage reconciler retries physical file
removal asynchronously until it succeeds.

Public forum posts and comments are retained for thread continuity and moderation, but
their author ID is replaced with the system `anonymous` account and their displayed
author name becomes `Deleted user`. Public course reviews are retained but their
`user_id` is cleared. No blanket database cascade is used.

The intentional non-FK user references are public/forum and audit history: post and
comment authors (pseudonymized on deletion), review authors (cleared on deletion),
audit/outbox history, and moderation actor fields. Pending deletion intents reference
blob paths only and carry no owner reference, so they never block account deletion.
Timetable entries, timetable snapshots, and calendar events also retain
application-enforced ownership checks so client import/sync flows are not
broken by a database migration. They are still deleted explicitly by the lifecycle
transaction. These references are handled by the lifecycle transaction or retention
policy rather than being allowed to block account deletion.
