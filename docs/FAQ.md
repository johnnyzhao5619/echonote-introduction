# Frequently Asked Questions (FAQ)

This document answers common questions about the EchoNote introduction page project.

## Table of Contents

- [General Questions](#general-questions)
- [Development Questions](#development-questions)
- [Translation Questions](#translation-questions)
- [Deployment Questions](#deployment-questions)
- [Performance Questions](#performance-questions)
- [Troubleshooting](#troubleshooting)

## General Questions

### What is the EchoNote introduction page?

The EchoNote introduction page is a static website that serves as the main landing page for the EchoNote project. It provides information about EchoNote's features, installation instructions, and community resources.

### What technologies are used?

- **Frontend**: Vue 3 with Composition API and TypeScript
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **Internationalization**: Vue I18n
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

### How is this different from the main EchoNote application?

This is a separate project focused solely on providing information about EchoNote. The main EchoNote application is a desktop application for voice transcription and calendar management, while this is a web-based introduction and documentation site.

### Who maintains this project?

The project is maintained by the EchoNote team and community contributors. See the [CONTRIBUTING.md](./CONTRIBUTING.md) file for information on how to contribute.

## Development Questions

### How do I set up the development environment?

1. **Prerequisites**:
   - Node.js 18+ and npm
   - Git

2. **Setup**:

   ```bash
   git clone https://github.com/echonote/echonote-introduction.git
   cd echonote-introduction
   npm install
   npm run dev
   ```

3. **Access**: Open `http://localhost:5173` in your browser

### What's the project structure?

```
echonote-introduction/
├── src/
│   ├── components/        # Vue components
│   ├── composables/       # Vue composables
│   ├── locales/          # Translation files
│   ├── utils/            # Utility functions
│   └── assets/           # Static assets
├── public/               # Public assets
├── docs/                 # Documentation
└── tests/                # Test files
```

### How do I add a new component?

1. Create the component file in the appropriate directory:
   - `src/components/common/` for reusable components
   - `src/components/sections/` for page sections
   - `src/components/ui/` for basic UI components

2. Use TypeScript and the Composition API:

   ```vue
   <script setup lang="ts">
   interface Props {
     title: string
   }

   const props = defineProps<Props>()
   </script>

   <template>
     <div>{{ title }}</div>
   </template>
   ```

3. Export from the appropriate index file if needed

### How do I add new styles?

Use Tailwind CSS utility classes. For custom styles:

1. **Utility Classes**: Use existing Tailwind classes when possible
2. **Component Styles**: Use scoped styles in Vue components
3. **Global Styles**: Add to `src/assets/styles/main.css`

### How do I handle state management?

For simple state, use Vue's built-in reactivity. For complex state:

1. **Composables**: Create reusable composables in `src/composables/`
2. **Props/Events**: Use for component communication
3. **Provide/Inject**: For deeply nested components

## Translation Questions

### How do I add a new language?

1. **Create Translation File**:

   ```bash
   cp src/locales/en.json src/locales/[LANGUAGE_CODE].json
   ```

2. **Update Configuration**:
   - Add language to `src/types/i18n.ts`
   - Update `SUPPORTED_LANGUAGES` array

3. **Translate Content**:
   - Translate all keys in the new file
   - Maintain consistency with terminology
   - Test layout compatibility

4. **Validate**:
   ```bash
   npm run validate-translations
   ```

### How do I update existing translations?

1. **Edit Translation File**: Modify the appropriate file in `src/locales/`
2. **Maintain Structure**: Keep the same JSON structure
3. **Test Changes**: Run `npm run dev` and test in browser
4. **Validate**: Use `npm run validate-translations`

### What are the translation guidelines?

- **Consistency**: Use the same terms throughout
- **Context**: Consider UI placement and constraints
- **Length**: Keep text appropriate for UI elements
- **Culture**: Adapt for local conventions
- **Technical Terms**: Use established terminology

### How do I handle text that's too long?

1. **Shorten Text**: Reduce word count while maintaining meaning
2. **Abbreviations**: Use appropriate abbreviations
3. **Line Breaks**: Allow text to wrap naturally
4. **UI Adjustments**: Modify component layout if necessary

## Deployment Questions

### How is the site deployed?

The site is automatically deployed to GitHub Pages using GitHub Actions:

1. **Trigger**: Push to main branch
2. **Build**: GitHub Actions runs build process
3. **Deploy**: Built files are deployed to GitHub Pages
4. **Access**: Site is available at the configured URL

### How do I deploy manually?

```bash
# Build the project
npm run build

# Deploy to GitHub Pages (if configured)
npm run deploy
```

### What happens if deployment fails?

1. **Check Logs**: Review GitHub Actions logs
2. **Fix Issues**: Address any build errors
3. **Retry**: Push fixes to trigger new deployment
4. **Rollback**: Revert to last working commit if needed

### How do I configure a custom domain?

1. **Add CNAME File**: Create `public/CNAME` with your domain
2. **Configure DNS**: Point your domain to GitHub Pages
3. **Enable HTTPS**: Configure in GitHub repository settings

## Performance Questions

### How do I optimize performance?

1. **Images**:

   ```bash
   npm run optimize-images
   ```

2. **Bundle Size**:

   ```bash
   npm run analyze
   ```

3. **Lighthouse Audit**:
   ```bash
   npm run lighthouse
   ```

### What are the performance targets?

- **Lighthouse Score**: 90+ for all categories
- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### How do I monitor performance?

1. **Lighthouse CI**: Automated performance testing
2. **Web Vitals**: Monitor real user metrics
3. **Bundle Analysis**: Track JavaScript size
4. **Image Optimization**: Monitor image loading

### Why is the site slow?

Common causes and solutions:

1. **Large Images**: Optimize and use WebP format
2. **JavaScript Bundle**: Use code splitting and lazy loading
3. **Network Issues**: Check CDN and hosting performance
4. **Third-party Scripts**: Minimize external dependencies

## Troubleshooting

### Build fails with TypeScript errors

```bash
# Check TypeScript configuration
npm run type-check

# Fix common issues
npm run lint:fix

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Translations not working

1. **Check File Format**: Ensure valid JSON syntax
2. **Validate Keys**: Run `npm run validate-translations`
3. **Check Import**: Verify language is imported in i18n config
4. **Browser Cache**: Clear browser cache and reload

### Images not loading

1. **Check File Paths**: Ensure correct relative paths
2. **File Format**: Use supported formats (jpg, png, webp, svg)
3. **File Size**: Optimize large images
4. **Browser Cache**: Clear cache and reload

### Styles not applying

1. **Tailwind Classes**: Verify class names are correct
2. **CSS Specificity**: Check for conflicting styles
3. **Scoped Styles**: Ensure proper scoping in Vue components
4. **Build Process**: Rebuild the project

### Development server not starting

```bash
# Check Node.js version
node --version  # Should be 18+

# Clear cache
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
lsof -i :5173  # Kill conflicting processes
```

### GitHub Actions failing

1. **Check Logs**: Review detailed error messages
2. **Dependencies**: Ensure package.json is up to date
3. **Secrets**: Verify required secrets are configured
4. **Permissions**: Check repository permissions

### Site not updating after deployment

1. **Cache**: Clear browser cache
2. **CDN**: Wait for CDN propagation (up to 24 hours)
3. **DNS**: Check DNS configuration
4. **Deployment**: Verify deployment completed successfully

## Getting Help

### Where can I get support?

1. **Documentation**: Check existing documentation first
2. **GitHub Issues**: Search existing issues or create new one
3. **GitHub Discussions**: Ask questions in discussions
4. **Community**: Reach out to community members

### How do I report a bug?

1. **Search Existing Issues**: Check if already reported
2. **Create Issue**: Use the bug report template
3. **Provide Details**: Include steps to reproduce, expected behavior, and screenshots
4. **Environment**: Specify browser, OS, and other relevant details

### How do I request a feature?

1. **Check Roadmap**: See if feature is already planned
2. **Create Issue**: Use the feature request template
3. **Describe Use Case**: Explain why the feature is needed
4. **Discuss**: Engage with maintainers and community

### How do I contribute?

See the [CONTRIBUTING.md](./CONTRIBUTING.md) file for detailed contribution guidelines.

---

**Still have questions?** Feel free to ask in [GitHub Discussions](https://github.com/echonote/echonote-introduction/discussions) or create an [issue](https://github.com/echonote/echonote-introduction/issues).
