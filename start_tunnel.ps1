$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
$preview = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "preview", "--prefix", "project", "--", "--host", "127.0.0.1", "--port", "4173" -PassThru
Start-Sleep -Seconds 4
ssh.exe -o StrictHostKeyChecking=no -R 80:127.0.0.1:4173 nokey@localhost.run
