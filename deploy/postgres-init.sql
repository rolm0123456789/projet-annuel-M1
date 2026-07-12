-- Exécuté uniquement à la première initialisation du volume PostgreSQL.
--
-- Rôle applicatif dédié, volontairement NON superutilisateur : PostgreSQL
-- exempte les superutilisateurs de la Row-Level Security. Les services se
-- connectent avec ce rôle, propriétaire de leurs bases (le FORCE ROW LEVEL
-- SECURITY posé par les services s'applique aussi au propriétaire).
CREATE ROLE business_first_app LOGIN PASSWORD 'business_first_app' NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;

-- Une base par microservice, détenue par le rôle applicatif.
CREATE DATABASE auth_db OWNER business_first_app;
CREATE DATABASE product_db OWNER business_first_app;
CREATE DATABASE order_db OWNER business_first_app;
CREATE DATABASE inventory_db OWNER business_first_app;
CREATE DATABASE payment_db OWNER business_first_app;
CREATE DATABASE shipping_db OWNER business_first_app;
