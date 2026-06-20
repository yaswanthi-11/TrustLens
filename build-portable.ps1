$ErrorActionPreference = 'Stop'

$projDir = "c:\Users\yaswanthi\OneDrive\Desktop\TrustLens"
$toolsDir = "$projDir\.tools"
if (-not (Test-Path $toolsDir)) { New-Item -ItemType Directory -Path $toolsDir | Out-Null }

Write-Host "Setting up portable build environment in $toolsDir..."

# JDK 21
$jdkUrl = "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.4%2B7/OpenJDK21U-jdk_x64_windows_hotspot_21.0.4_7.zip"
$jdkZip = "$toolsDir\jdk.zip"
$jdkDir = "$toolsDir\jdk-21.0.4+7"
if (-not (Test-Path $jdkDir)) {
    Write-Host "Downloading JDK 21..."
    Invoke-WebRequest -Uri $jdkUrl -OutFile $jdkZip
    Write-Host "Extracting JDK 21..."
    Expand-Archive -Path $jdkZip -DestinationPath $toolsDir -Force
}
$env:JAVA_HOME = $jdkDir
$env:PATH = "$jdkDir\bin;" + $env:PATH

# Maven
$mvnUrl = "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"
$mvnZip = "$toolsDir\maven.zip"
$mvnDir = "$toolsDir\apache-maven-3.9.6"
if (-not (Test-Path $mvnDir)) {
    Write-Host "Downloading Maven..."
    Invoke-WebRequest -Uri $mvnUrl -OutFile $mvnZip
    Write-Host "Extracting Maven..."
    Expand-Archive -Path $mvnZip -DestinationPath $toolsDir -Force
}
$env:M2_HOME = $mvnDir
$env:PATH = "$mvnDir\bin;" + $env:PATH

# Node.js
$nodeUrl = "https://nodejs.org/dist/v20.12.0/node-v20.12.0-win-x64.zip"
$nodeZip = "$toolsDir\node.zip"
$nodeDir = "$toolsDir\node-v20.12.0-win-x64"
if (-not (Test-Path $nodeDir)) {
    Write-Host "Downloading Node.js..."
    Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeZip
    Write-Host "Extracting Node.js..."
    Expand-Archive -Path $nodeZip -DestinationPath $toolsDir -Force
}
$env:PATH = "$nodeDir;" + $env:PATH

Write-Host "Verifying tools:"
java -version
mvn -version
node -version
npm -version

Write-Host "---"
Write-Host "Building Frontend..."
npm install --prefix "$projDir\frontend"
npm run build --prefix "$projDir\frontend"

Write-Host "---"
Write-Host "Building Backend..."
mvn clean package -DskipTests -f "$projDir\pom.xml"

Write-Host "---"
Write-Host "Build completed successfully!"
