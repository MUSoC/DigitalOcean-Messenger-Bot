#! /bin/bash

printf "Memory\tDisk\tCPU\n"
while true
do
	MEMORY=$(free -m | awk 'NR==2{printf "%.2f%%\t\t", $3*100/$2 }')
	DISK=$(df -h | awk '$NF=="/"{printf "%s\t\t", $5}')
	CPU=$(top -bn1 | grep load | awk '{printf "%.2f%%\t\t\n", $(NF-2)}')
	echo "$MEMORY$DISK$CPU"
	sleep 1
done