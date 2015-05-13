startInstallation(){
	echo "ok, starting installation. (this may take some time) "
	apt-get install npm nodejs
	npm update --save
	nohup node machine.js > output.txt &
	echo "Please go to: "
	ifconfig eth0 | awk '/inet addr/{print substr($2,6)}' | awk '{print $0"/config"}'
	echo "And configure the information you want."
	echo "If you want to add or configure sensors, go to: "
	ifconfig eth0 | awk '/inet addr/{print substr($2,6)}' | awk '{print $0"/addSensor"}'
	echo "Please note that you have to be on the same network, to access the machines ip. "
}


while true; do
    read -p "Do you wish to install this program? (Y/n) " yn
    case $yn in
        [Yy]* ) startInstallation; break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

