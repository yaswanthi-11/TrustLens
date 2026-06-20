@echo off
set JAVA_HOME=c:\Users\yaswanthi\OneDrive\Desktop\TrustLens\.tools\jdk-21.0.4+7
set PATH=%JAVA_HOME%\bin;%PATH%
echo --- Java Version --- > c:\Users\yaswanthi\OneDrive\Desktop\TrustLens\diagnose.log
java -version 2>> c:\Users\yaswanthi\OneDrive\Desktop\TrustLens\diagnose.log
echo --- Maven Version --- >> c:\Users\yaswanthi\OneDrive\Desktop\TrustLens\diagnose.log
c:\Users\yaswanthi\OneDrive\Desktop\TrustLens\.tools\apache-maven-3.9.6\bin\mvn.cmd -version >> c:\Users\yaswanthi\OneDrive\Desktop\TrustLens\diagnose.log 2>&1
echo --- Node Version --- >> c:\Users\yaswanthi\OneDrive\Desktop\TrustLens\diagnose.log
c:\Users\yaswanthi\OneDrive\Desktop\TrustLens\.tools\node-v20.12.0-win-x64\node.exe -v >> c:\Users\yaswanthi\OneDrive\Desktop\TrustLens\diagnose.log 2>&1
echo --- NPM Version --- >> c:\Users\yaswanthi\OneDrive\Desktop\TrustLens\diagnose.log
c:\Users\yaswanthi\OneDrive\Desktop\TrustLens\.tools\node-v20.12.0-win-x64\npm.cmd -v >> c:\Users\yaswanthi\OneDrive\Desktop\TrustLens\diagnose.log 2>&1
