
export mysqlHost='localhost'
export mysqlUser='root'
export mysqlPass=''
export mysqlDb='quack'


if [ -f ./config.local.sh ]; then
	. ./config.local.sh
fi


sqlCreds="-h$mysqlHost -u$mysqlUser"
if [ "$mysqlPass" ]; then sqlCreds="$sqlCreds -p'$mysqlPass'"; fi
export sqlCreds
