@echo off
setlocal

set "SERENA_PORT=9121"

where uv >nul 2>nul
if errorlevel 1 (
  echo [ERROR] uv not found in PATH.
  exit /b 1
)

where codex >nul 2>nul
if errorlevel 1 (
  echo [ERROR] codex not found in PATH.
  exit /b 1
)

for /f %%i in ('powershell -NoProfile -Command "(Test-NetConnection -ComputerName 127.0.0.1 -Port %SERENA_PORT%).TcpTestSucceeded"') do set "PORT_OK=%%i"

if /i "%PORT_OK%"=="True" (
  echo [INFO] serena already running on port %SERENA_PORT%.
) else (
  echo [INFO] starting serena on port %SERENA_PORT%...
  start "" /B uv run serena start-mcp-server --context codex --transport streamable-http --port %SERENA_PORT%
  timeout /t 1 /nobreak >nul
)

echo [INFO] starting codex...
codex %*

endlocal
