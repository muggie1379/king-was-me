@echo off
python -X utf8 "%~dp0MVP\development\collaboration\dashboard\visual_dashboard.py" %*
if errorlevel 1 pause
