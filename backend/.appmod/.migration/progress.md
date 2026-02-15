# Migration Progress - Output logs to file -> Output logs to console

Important Guideline

1. When you use terminal command tool, never input a long command with multiple lines, always use a single line command.
2. When performing semantic or intent-based searches, DO NOT search content from `.appmod/` folder.
3. Never create a new project in the solution, always use the existing project to add new files or update the existing files.
4. Minimize code changes: update only what's necessary for the migration.
5. Add New Package References to Projects as described in the migration plan.


- [ ] Inventory projects and determine frameworks
- [ ] Locate all file-logging usages and list files to update
- [ ] Add console-logging package(s)
- [ ] Replace code-level file logging APIs with console-logging APIs
- [ ] Update configuration files
- [ ] Remove obsolete file-logging packages and config entries
- [ ] Run build and fix compile issues
- [ ] Run CVE check on newly added packages
- [ ] Final validation and commit


Version control tasks

- [ ] Check git status before starting
- [ ] Create branch for migration
- [ ] Stage and commit changes after each task (do not commit `.appmod/`)
- [ ] Check for uncommitted changes before finishing

