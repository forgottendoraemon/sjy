/*数据库初始化脚本*/

-- Table: public.users

-- DROP TABLE public.users;

CREATE TABLE public.users
(
    id uuid NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(128) COLLATE pg_catalog."default" NOT NULL,
    roles character varying(50) COLLATE pg_catalog."default" NOT NULL,
    createtime timestamp without time zone,
    lastlogintime timestamp without time zone,
    email character varying(100) COLLATE pg_catalog."default",
    phonenumber character varying(16) COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.users
    OWNER to postgres;


-- Extension: postgis

-- DROP EXTENSION postgis;

CREATE EXTENSION postgis
    SCHEMA public
    VERSION "2.4.4";

-- Table: public.locations

-- DROP TABLE public.locations;

CREATE TABLE public.locations
(
    id uuid NOT NULL,
    geom geometry(Point,4326) NOT NULL,
    userid uuid NOT NULL,
    "time" timestamp without time zone NOT NULL,
    CONSTRAINT locations_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.locations
    OWNER to postgres;

-- Table: public.locationhistorys

-- DROP TABLE public.locationhistorys;

CREATE TABLE public.locationhistorys
(
    id uuid NOT NULL,
    geom geometry(Point,4326) NOT NULL,
    userid uuid NOT NULL,
    "time" timestamp without time zone NOT NULL,
    CONSTRAINT locationhistorys_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.locationhistorys
    OWNER to postgres;


CREATE TABLE public.camera
(
    id bigint NOT NULL,
    geom geometry(MultiPoint,4326),
    name character varying(80) COLLATE pg_catalog."default",
    info character varying(200) COLLATE pg_catalog."default",
    ip character varying(20) COLLATE pg_catalog."default",
    CONSTRAINT camera_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.camera
    OWNER to postgres;

-- Index: sidx_camera_geom

-- DROP INDEX public.sidx_camera_geom;

CREATE INDEX sidx_camera_geom
    ON public.camera USING gist
    (geom)
    TABLESPACE pg_default;