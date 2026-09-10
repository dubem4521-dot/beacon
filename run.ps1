Write-Host "Stopping old Container..." ForegroundColor Yellow
docker stop beacon

Write-Host "Removing old Container..." ForegroundColor Yellow
docker rm -f beacon

Write-Host "Building new Container..." ForgroundColor Green
docker build -t rustytoothpickk/beacon:latest .

Write-Host "Running new Container..." ForgroundColor Green
docker run -d --name beacon -p 8080:80 rustytoothpickk/beacon:latest
