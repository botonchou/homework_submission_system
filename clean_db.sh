#!/bin/bash -xe

exit -1

mongo <<EOF
use mydb
db.homeworks.drop()
exit
EOF
rm -rf public/homeworks/hw1/*
