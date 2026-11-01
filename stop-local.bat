@echo off
echo Stopping Practical 13 servers...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 :5001 :5173"') do (
  taskkill /F /PID %%a 2>nul
)
echo All Practical 13 local server processes stopped.

