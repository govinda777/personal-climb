# Database Entities (Schema Documentation)

The Personal Climb platform uses a relational schema powered by PostgreSQL and Drizzle ORM to manage state, billing, core application flows, and off-chain gamification components.

Below is an overview of the core entities and their purpose in the architecture.

## Identity and Gamification

### `profiles`
**Purpose:** Maps the user identity to the application logic. Uses the Privy DID as the primary identifier.
**Key Features:**
- Stores off-chain `xp` and `level` for gamification progression.
- Tracks `lastLoginAt` for computing daily streaks.

### `gamification_logs`
**Purpose:** An append-only ledger tracking all XP events associated with a profile.
**Key Features:**
- Associates a reason and points with an `xp` gain for historical and cooldown calculations.

## Core Roles: Personal Trainers & Athletes

### `personals`
**Purpose:** Represents a Personal Trainer on the platform. Contains configuration for their specific white-label hotsite.
**Key Features:**
- Uses a unique `slug` for Dynamic Next.js White-Label routing (`/personal/[slug]`).
- Integrates heavily with the Stripe API (`stripeCustomerId`, `subscriptionStatus`).
- Captures UI elements (e.g. `brandName`, `primaryColor`) combined with Sanity CMS for deep customization.

### `athletes`
**Purpose:** Represents an Athlete (student) actively engaging with a personal trainer.
**Key Features:**
- References the `personals` table.
- Stores baseline attributes like climbing grades (`vGradeLevel`, `frenchGradeLevel`) to be used later as context for the AI Copilot.
- The `isActive` flag determines usage-based billing components.

## Application Flows: Check-in & Schedules

### `anamnesis`
**Purpose:** Medical and onboarding context for the Athlete.
**Key Features:**
- Stores `medicalRestrictions`, `goals`, `lifestyleInfo`.
- Acts as a highly structured context payload mapped to the Gemini AI Agent to generate safer, personalized training schedules.

### `schedule_slots`
**Purpose:** Timeblocks created by Personal Trainers for in-person or online coaching.
**Key Features:**
- Handles `maxCapacity` constraints effectively. Updates and creates here enforce `Serializable` PostgreSQL isolation levels to safely avert overbooking scenarios.

### `checkins`
**Purpose:** Link between an Athlete and a Schedule Slot.
**Key Features:**
- A Unique Index prevents an athlete from claiming the same slot multiple times. Critical infrastructure for gym flow.

## AI Prescriptions & Workouts

### `training_packages`
**Purpose:** Represents the service offerings sold by the personal trainer via the hotsite integration with Stripe Checkout.

### `training_plans`
**Purpose:** Represents a structured workout timeline prescribed by the trainer (or AI).
**Key Features:**
- Features an `aiRationale` string detailing why the Gemini model prescribed this plan based on the `anamnesis` parameters.
- Has a Draft vs Active state workflow (Human-in-the-loop requirement).

### `workout_sessions` & `workout_exercises`
**Purpose:** Represent the specific routines tied to a training plan.
**Key Features:**
- `workout_exercises` stores an `exerciseId`, acting as a foreign key pointing to the **Sanity CMS Knowledge Base**, isolating relational progress logic from multimedia rich exercise references.

### `workout_logs`
**Purpose:** The feedback loop.
**Key Features:**
- Stores RPE (Rating of Perceived Exertion) and feelings submitted by the athlete post-workout. Feeds into future AI generation schemas.
