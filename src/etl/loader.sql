BEGIN;

DROP DATABASE IF EXISTS "samwise-qa-db-test";

CREATE DATABASE "samwise-qa-db-test"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE ALL ON TABLES FROM postgres;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres
GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;

CREATE TABLE IF NOT EXISTS public.answers
(
    id integer NOT NULL,
    question_id integer NOT NULL,
    body text COLLATE pg_catalog."default" NOT NULL,
    date_written text COLLATE pg_catalog."default" NOT NULL,
    answerer_name text COLLATE pg_catalog."default" NOT NULL,
    answerer_email text COLLATE pg_catalog."default" NOT NULL,
    reported integer NOT NULL,
    helpful integer NOT NULL,
    CONSTRAINT answers_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.answers_photos
(
    id integer NOT NULL,
    answer_id integer NOT NULL,
    url text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT answers_photos_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.questions
(
    id integer,
    product_id integer,
    body text COLLATE pg_catalog."default",
    date_written text COLLATE pg_catalog."default",
    asker_name text COLLATE pg_catalog."default",
    asker_email text COLLATE pg_catalog."default",
    reported integer,
    helpful integer
);

ALTER TABLE IF EXISTS public.answers
    ADD CONSTRAINT question_id FOREIGN KEY (question_id)
    REFERENCES public.questions (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.answers_photos
    ADD CONSTRAINT answer_id FOREIGN KEY (answer_id)
    REFERENCES public.answers (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

END;