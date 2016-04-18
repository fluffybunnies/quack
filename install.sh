#!/bin/bash

. ./config.sh


# ----- DB
echo "create database if not exists $mysqlDb" | mysql $sqlCreds
(echo "use $mysqlDb;" && cat ./install/db.sql) | mysql $sqlCreds

