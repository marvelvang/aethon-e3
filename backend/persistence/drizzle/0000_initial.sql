CREATE TABLE IF NOT EXISTS "games" (
    "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    "state"      jsonb NOT NULL
);
