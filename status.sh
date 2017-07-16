#! /bin/bash

MEMORY=$(free -m | awk 'NR==2{printf "%.2f\t\t", $3*100/$2 }')
DISK=$(df -h | awk '$NF=="/"{printf "%s\t\t", $5}')
CPU=$(top -bn1 | grep load | awk '{printf "%.2f\t\t\n", $(NF-2)}')
D=$(echo $DISK| cut -d '%' -f 1)

curl --data "memory=$MEMORY&cpu=$CPU&disk=$DISK" https://www.diuda.me:444/status
