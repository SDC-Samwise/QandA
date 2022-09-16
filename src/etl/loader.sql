-- This script was generated by a beta version of the ERD tool in pgAdmin 4.
-- Please log an issue at https://redmine.postgresql.org/projects/pgadmin4/issues/new if you find any bugs, including reproduction steps.
BEGIN;


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


COPY public.answers(id, question_id, body, date_written, answerer_name, answerer_email, reported, helpful)
FROM 'path to the csv'
DELIMITER ','
CSV HEADER;

COPY public.answers(id, answer_id, url)
FROM 'path to the csv'
DELIMITER ','
CSV HEADER;

COPY public.answers(id, product_id, body, date_written, asker_name, asker_email, reported, helpful)
FROM 'path to the csv'
DELIMITER ','
CSV HEADER;

END;