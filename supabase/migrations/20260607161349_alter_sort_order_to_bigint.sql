/*
# Alter sort_order column to bigint

The sort_order column was defined as integer, which overflows when populated
with Unix epoch seconds (currently ~1.75B and growing toward the 2.1B integer max).
Changing to bigint prevents insert errors when adding new vehicles.
*/

ALTER TABLE voitures ALTER COLUMN sort_order TYPE bigint;
