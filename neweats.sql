\echo 'Delete and recreate neweats db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE neweats;
CREATE DATABASE neweats;
\connect neweats

\i neweats-schema.sql
\i neweats-seed.sql

\echo 'Delete and recreate neweats_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE neweats_test;
CREATE DATABASE neweats_test;
\connect neweats_test

\i neweats-schema.sql
