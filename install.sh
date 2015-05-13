startInstallation(){
	echo "ok, starting installation. (this may take some time) "
	apt-get install npm nodejs
	npm update --save
	echo "What should the name of this machine be? "
	read name
	echo "okay, the name of this machine is now $name"
	echo "What should the subtitle be? "
	read subtitle
	echo "okay, the subtitle is now: $subtitle"
	echo "{\"name\":\"$name\",\"subtitle\":\"$subtitle\"}" > config.properties
	nohup node machine.js > output.txt &
	echo "Please go to: "
	ifconfig eth0 | awk '/inet addr/{print substr($2,6)}' | awk '{print $0"/config"}'
	echo "And fill in the rest of the information."
}


while true; do
    read -p "Do you wish to install this program? (Y/n) " yn
    case $yn in
        [Yy]* ) startInstallation; break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

