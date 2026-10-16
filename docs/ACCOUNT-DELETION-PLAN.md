# Account deletion: implementation prerequisite and review contract (#17)

Status: **BLOCKED for product enablement**. Existing cloud deletion writes an
encrypted empty recovery state and retains Auth identity. It must not be relabeled
as account deletion. No endpoint, privileged credential, schema change or production
operation is introduced by this preparation PR.

## Why a standalone admin DELETE is insufficient

Current documented staging schema gives `user_data.user_id` an ownership policy,
but no foreign key to `auth.users`. Production schema has not been inspected.
Supabase states that deleting an Auth user does not invalidate already-issued
access JWTs until expiry. Deleting a row and then the Auth identity can leave a
partial result; stale sessions can recreate a row under the documented ownership
policy. A server endpoint alone cannot establish safe deletion against that schema.

Before enabling deletion, independently verify an atomic database relationship
between the Auth identity and recovery row, and a database-enforced prohibition
on writes for deleted identities. A validated `auth.users(id)` foreign key with
delete cascade is a candidate, subject to schema/orphan analysis and isolated
testing. Do not inspect real recovery content for that analysis. Any production
schema/configuration change requires separate owner authorization.

## Required server contract

- Destructive action is explicit and confirmed; local export remains available.
- Accept only an authenticated bearer request, validate through current Supabase
  Auth `getUser`, and derive the target ID from that verified response. Reject
  caller-supplied target IDs and never authorize using user metadata or a merely
  decoded JWT. Define a recent-verification/session policy before enablement.
- Keep the privileged admin credential in server-only configuration. Never ship
  it in the static build, public backend asset, client request, logs or screenshots.
- Require verified infrastructure preconditions; missing configuration fails
  closed. Preview/local test services must never select production as fallback.
- Prefer deletion of Auth with a verified atomic recovery-row cascade, rather
  than a separate destructive recovery-row write before Auth deletion. Account
  removal must prevent stale-token and old-tab resurrection at the database layer.
- Define idempotent retries and an operation receipt/status mechanism before
  clearing local data. A lost response or 401 on retry is not evidence of success.
- Pause autosave/push during confirmation/execution; bind the operation to the
  original account and abort local cleanup if the account changes. Clear local
  data/auth/key material only after confirmed server success. Coordinate other
  tabs. Storage cleanup failures must be reported truthfully without silent loss.
- Do not log tokens, recovery content, email addresses, recovery keys or payloads.
  Handle Auth/Storage restrictions and partial failures without broad cleanup.

## Isolated acceptance matrix

Use two disposable synthetic identities and a fresh independent browser context:

| Scenario | Required result |
| --- | --- |
| Missing/expired/forged token | No admin deletion or data write |
| Peer target in request or user metadata | Rejected; peer account/row untouched |
| Valid own-account request | Auth identity and only its recovery row removed atomically |
| Pre-deletion JWT used after success | SELECT/INSERT/UPDATE/DELETE cannot expose or recreate data |
| Pending autosave, second tab, account switch | No resurrection or cleanup of another account |
| Provider failure, timeout, lost response, duplicate request | Truthful status and safe idempotent recovery |
| Browser storage cleanup failure | Server result distinguished from device cleanup status |
| Account owns Storage objects | Known rejection/precondition; no arbitrary user-object deletion |
| Preview configuration absent/wrong | Fails closed; zero production requests |

The retired staging service cannot supply this evidence. A dashboard-created
synthetic Auth identity without a reachable mailbox does not establish the app's
magic-link sign-in or ownership-policy acceptance. No password flow should be
added to bypass the product's Auth contract.

References checked 2026-10-15:
[Supabase user management](https://supabase.com/docs/guides/auth/managing-user-data),
[admin deleteUser](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser).
The current changelog was reviewed; upcoming legacy TLS cipher removal does not
change the deletion/JWT requirements above. The Markdown changelog fetch was
unsupported, so the official HTML changelog was used.

Merge recommendation: documentation/preparation only, after independent review.
Keep #17 open. A later implementation PR must include actual isolated Auth and
database evidence, reviewed infrastructure changes and explicit enablement gates.
