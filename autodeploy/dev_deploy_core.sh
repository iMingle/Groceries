#!/usr/bin/expect
source dev_common_param.sh
set timeout 300
spawn ssh ${user}@${ip}
expect {
	"yes/no" {
		send "yes\r"
		expect "password:"
		send "$pwd\r"
	}

	"password:" {send "$pwd\r"}
}
#expect "password:"
#send "$pwd\r"
expect "${user}@"
send "sudo su -\r"
expect "password"
send "$pwd\r"

expect "root@"
send "cd ${gitPath}/${projectName}\r"

expect "root@"
send "git pull $remoteGit $branch:deploy\r"
expect "Username"
send "${gitUser}\r"
expect "Password"
send "${gitPwd}\r"
expect "root@"
send "git checkout deploy\r"
expect "deploy"
send "mvn clean package -P ${projectEnv}\r"
expect "root@"
send "cd ${deployPath}/${projectName}/bin/\r"
expect "root@"
send "bash stop.sh\r";
#备份bin 和prop目录
expect "root@"
send "mkdir -p /home/$user/${projectName}\r"
expect "root@"
send "cp -rf ${deployPath}/${projectName}/bin /home/$user/${projectName}\r"
expect "root@"
send "cp -rf ${deployPath}/${projectName}/conf/prop /home/$user/${projectName}\r"



expect "root@"
send "rm -r ${deployPath}/${projectName}\r"
expect "root@"
send "cp -r ${gitPath}/${projectName}/${projectName}-main/target/${projectName}-main-${projectVersion}/${projectName}-main-${projectVersion}/ ${deployPath}/${projectName}\r";

#还原备份的文件
expect "root@"
send "cp -rf /home/$user/${projectName}/bin/* ${deployPath}/${projectName}/bin\r"
expect "root@"
send "cp -rf /home/${user}/${projectName}/prop/* $deployPath/${projectName}/conf/prop/\r"

expect "root@"
send "cd ${deployPath}/${projectName}/bin/\r"
expect "root@"
send "rm -r nohup.out logs/\r"
expect "root@"
send "bash start.sh\r"
expect "nohup:"
send "echo\r"
expect "root@"
send "exit\r"
expect "${user}@"
send "exit\r"
#interact
 
expect eof

