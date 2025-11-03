# Development Guide

This document provides information about the development setup and tools configured for the EchoNote Introduction Page project.

## Development Tools Configuration

### Code Quality Tools

- **ESLint**: Configured with Vue 3 and TypeScript best practices
- **Prettier**: Code formatting with consistent style rules
- **Husky**: Git hooks for automated code quality checks
- **lint-staged**: Run linters on staged files before commit

### Git Hooks

- **pre-commit**: Runs ESLint and Prettier on staged files
- **commit-msg**: Enforces conventional commit message format

### VS Code Configuration

The project includes VS Code workspace settings for:

- Automatic code formatting on save
- ESLint integration with auto-fix
- Recommended extensions for Vue 3 development
- File nesting patterns for better organization

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run type-check

# Run linting with auto-fix
npm run lint

# Format code
npm run format
```

## Code Style Guidelines

### Commit Messages

Follow conventional commit format:

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Example: feat(components): add navigation bar component
```

### Code Formatting

- Use 2 spaces for indentation
- Single quotes for strings
- No semicolons
- Line length limit: 100 characters
- Trailing commas in ES5 contexts

### Vue 3 Best Practices

- Use Composition API with `<script setup>`
- PascalCase for component names in templates
- camelCase for custom events
- Prefer separate static classes

### TypeScript Guidelines

- Avoid explicit `any` types (warnings enabled)
- Use meaningful variable names with underscore prefix for unused parameters
- No inferrable types (let TypeScript infer when possible)

## Pre-commit Checks

Before each commit, the following checks run automatically:

1. ESLint with auto-fix on staged JavaScript/TypeScript/Vue files
2. Prettier formatting on all staged files
3. Commit message format validation

## VS Code Extensions

Recommended extensions (automatically suggested):

- Vue.volar - Vue 3 language support
- dbaeumer.vscode-eslint - ESLint integration
- esbenp.prettier-vscode - Prettier formatting
- bradlc.vscode-tailwindcss - Tailwind CSS IntelliSense
- EditorConfig.EditorConfig - EditorConfig support

## Troubleshooting

### ESLint Issues

If ESLint shows errors, run:

```bash
npm run lint
```

### Formatting Issues

To format all files:

```bash
npm run format
```

### Type Errors

Check TypeScript issues:

```bash
npm run type-check
```

### Git Hook Issues

If pre-commit hooks fail, fix the issues and commit again. The hooks ensure code quality and consistency.
