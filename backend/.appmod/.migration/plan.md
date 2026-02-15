# .NET App Migration Prompt Template: Output logs to file to Output logs to console

## Migration Request

Migrate this codebase from "output logs to file" (Technology X) to "output logs to console" (Technology Y), focusing exclusively on code-level changes required for successful compilation.

## Tools Usage

You MUST use the tools from `#ConsoleLoggingKnowledgeBase` for more detailed Console logging specs and console-logging samples.
- Serve as a knowledge base when creating the plan and when making code changes.
- Refer to the code samples for implementation guidance and consistent code style.

## Scope

- DO - Collect the framework used (.NET or .NET Framework) and keep the original project framework
- DO - Code modification to replace file-based logging dependencies with console logging equivalents
- DO - Configuration file updates necessary for compilation
- DO - Dependency management changes
- DO - Update the function references to use the new console logging functions
- DO NOT - No new business logic, features, or functionality beyond what exists
- DO NOT - No enhancements to existing business logic
- DO NOT - No testing beyond compilation verification
- DO NOT - No deployment considerations

## Success Criteria

1. All file-based logging dependencies and imports are replaced.
2. All old file-logging code files and project configurations are cleaned from the solution.
3. Codebase compiles successfully with console logging.
4. All migration tasks are tracked and marked as completed in `progress.md`.
5. All uncommitted changes are committed if a VCS is detected (excluding `.appmod/`).

---

## Current Codebase Analysis (automated scan)

I attempted to discover solution/project files and search the workspace for common file-logging usages (e.g., `File.AppendAllText`, `new StreamWriter`, `Serilog` file sinks, `NLog` file targets, `log4net` appenders). No projects or relevant source files were discovered in the current workspace during the automated scan.

If your repository is open in the workspace, ensure the solution or project files are present. The migration plan below assumes projects will be discovered in a follow-up scan and is designed to run once the workspace contains the solution files.

---

## Analyze and Identify Migration Tasks

1. Read the `#ConsoleLoggingKnowledgeBase` for Console logger patterns and recommended packages (e.g., `Microsoft.Extensions.Logging.Console`, `Serilog.Sinks.Console`, `NLog.Targets.Console`) and note the appropriate package versions for the target framework. (Versions to be populated after project detection.)

2. Scan the codebase to identify all usages of file-based logging and produce a list of files to modify. Typical candidates to search for:
 - `System.IO.File`, `File.AppendAllText`, `File.WriteAllText`
 - `new StreamWriter`, `StreamWriter` usages
 - `Serilog` with `WriteTo.File` or `WriteTo.RollingFile` or `Serilog.Sinks.File`
 - `NLog` with `File` targets defined in config or `NLog.Targets.File` in code
 - `log4net` with `FileAppender` or `RollingFileAppender`
 - Direct traces writing to files (`Trace.Listeners` with `TextWriterTraceListener`)

3. Identify required code edits for each file found: replace file sinks with console providers or console sinks provided by the logging library in use.

4. Identify configuration files to update (e.g., `appsettings.json`, `NLog.config`, `log4net.config`, `Web.config`, `App.config`) and prepare replacement snippets that route logging to console.

5. Determine project type (SDK-style or legacy) for dependency management and list packages to add. Do NOT change target framework.

6. Prepare a CI-friendly migration branch and a commit plan. The branch name template:

 `appmod/dotnet-migration-output-file-to-console-[CurrentTimestamp]`

 Replace `[CurrentTimestamp]` with UTC timestamp in `yyyyMMddHHmmss` format when creating the branch.

---

## Required Packages (to be finalized after project detection)

Potential packages (pick the one that matches the project's existing logging library):
- For Microsoft.Extensions.Logging: `Microsoft.Extensions.Logging.Console`
- For Serilog: `Serilog.Sinks.Console`
- For NLog: `NLog.Targets.Console` (or update `NLog.config` to use console target)
- For log4net: use `ConsoleAppender` configuration (no extra NuGet required)

(Exact package IDs and versions will be discovered and fixed in the next step once the project files are available.)

---

## Migration Tasks (high-level)

1. Inventory projects and determine frameworks.
2. Locate all file-logging usages and list files to update.
3. Add console-logging package(s) appropriate for the existing logging library.
4. Replace code-level file logging APIs with console-logging APIs or providers.
5. Update configuration files to remove file sinks and enable console.
6. Remove obsolete file-logging packages and config entries.
7. Run build and fix compile issues.
8. Run CVE check on newly added packages and resolve any issues.
9. Final validation and commit; update `progress.md` accordingly.

---

## Version control and branching (instructions to execute before code changes)

1. If a git repository is present, run `git status --porcelain` and ensure working tree is clean or stash uncommitted changes (excluding `.appmod/`).
2. Obtain current UTC timestamp and replace `[CurrentTimestamp]` in the branch name.
3. Create and switch to the new branch using `git checkout -b appmod/dotnet-migration-output-file-to-console-[CurrentTimestamp]`.
4. Commit after each migration task with concise messages. Do NOT commit files under `.appmod/`.

---

## Notes & Next Steps

- I could not find any projects or source files in the current workspace. To proceed, please ensure the repository with the solution (`.sln`) or project files (`.csproj`) is available in the workspace, or give me the path to the project folder.

- After you confirm the workspace contains the projects (or provide access), I will update this plan with exact package versions and a file-level change list.

- I created `progress.md` alongside this plan; review it and then type `Continue` to let me proceed with the migration steps described.

---

## References

- Console logging guidance: `#ConsoleLoggingKnowledgeBase`



