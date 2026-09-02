@echo off
echo =========================================================
echo    COMPILANDO BACKEND HORUS (JDK 21 + Maven 3.8.8)
echo =========================================================

SET JAVA_HOME=C:\Program Files\Java\jdk-21
SET PATH=%JAVA_HOME%\bin;C:\apache-maven-3.8.8\bin;%PATH%

echo [+] Verificando Java...
java -version

echo [+] Compilando proyecto...
cd backend
call C:\apache-maven-3.8.8\bin\mvn.cmd clean package -DskipTests

if %ERRORLEVEL% NEQ 0 (
    echo [!!] Error de compilacion. Revisa los logs.
    pause
    exit /b 1
)

echo.
echo =========================================================
echo    COMPILACION EXITOSA - JAR actualizado en backend/target
echo =========================================================
echo [i] Para iniciar el sistema con el nuevo JAR, ejecuta:
echo     .\ejecutar_sistema.bat
echo =========================================================
pause
