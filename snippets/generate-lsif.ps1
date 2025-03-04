$envFile = ".env"

$CODEBASEGRAPH_FILE = Select-String -Path $envFile -Pattern "CODEBASEGRAPH_FILE" | ForEach-Object { $_.Line.Split('=')[1].Trim() }
$CODEBASE_PATH = Select-String -Path $envFile -Pattern "CODEBASE_PATH" | ForEach-Object { $_.Line.Split('=')[1].Trim() }
$TSCONFIG_PATH = Select-String -Path $envFile -Pattern "TSCONFIG_FILE" | ForEach-Object { $_.Line.Split('=')[1].Trim() }
$PACKAGE_PATH = Select-String -Path $envFile -Pattern "PACKAGE_FILE" | ForEach-Object { $_.Line.Split('=')[1].Trim() }

npx lsif tsc -p $CODEBASE_PATH$TSCONFIG_PATH --package $CODEBASE_PATH$PACKAGE_PATH --outputFormat json --stdout > $CODEBASEGRAPH_FILE